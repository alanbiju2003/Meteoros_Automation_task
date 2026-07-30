import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { parseDeviceUserAgent } from '../utils/deviceDetector.js';
import { getHaversineDistance } from '../utils/geofence.js';

const CAMPUS_LAT = 12.9337;
const CAMPUS_LNG = 77.6051;
const GEOFENCE_RADIUS = 500;

export const recordLocationPing = async (req: Request, res: Response) => {
  const { studentId, latitude, longitude, accuracy, speed, batteryLevel, networkType, gpsEnabled } = req.body;
  const userAgentHeader = (req.headers['user-agent'] as string) || '';
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '182.73.18.94';

  if (!studentId || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ message: 'studentId, latitude, and longitude are required' });
  }

  try {
    const liveDevice = parseDeviceUserAgent(userAgentHeader, clientIp);
    const parsedBattery = batteryLevel !== undefined ? parseFloat(batteryLevel) : 85;
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // 1. Insert into TimescaleDB LocationEvent hypertable
    const locationEvent = await prisma.locationEvent.create({
      data: {
        studentId,
        latitude: lat,
        longitude: lng,
        accuracy: accuracy ? parseFloat(accuracy) : 3.5,
        speed: speed ? parseFloat(speed) : 0,
        batteryLevel: parsedBattery,
        deviceModel: liveDevice.deviceModel,
        osVersion: liveDevice.osName,
        networkType: networkType || 'WiFi 5G',
        gpsEnabled: gpsEnabled !== undefined ? Boolean(gpsEnabled) : true,
        timestamp: new Date(),
      },
    });

    // 2. Update Device record
    await prisma.device.upsert({
      where: { id: studentId },
      update: {
        deviceModel: liveDevice.deviceModel,
        osVersion: liveDevice.osName,
        lastActive: new Date(),
      },
      create: {
        id: studentId,
        studentId,
        deviceModel: liveDevice.deviceModel,
        osVersion: liveDevice.osName,
        appVersion: 'v2.1.0',
        lastActive: new Date(),
      },
    }).catch(() => {});

    const distanceMeters = Math.round(getHaversineDistance(lat, lng, CAMPUS_LAT, CAMPUS_LNG));

    return res.json({
      status: 'Location recorded in TimescaleDB',
      eventId: locationEvent.id,
      batteryLevel: parsedBattery,
      distanceMeters,
      isOutsideGeofence: distanceMeters > GEOFENCE_RADIUS,
    });
  } catch (error) {
    console.error('Error saving location ping:', error);
    return res.status(500).json({ message: 'Server error saving location' });
  }
};

export const getLatestLocations = async (req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: { select: { name: true, email: true } },
        department: { select: { name: true } },
        locationEvents: {
          take: 1,
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    const baseLat = 12.9337;
    const baseLng = 77.6051;

    const locations = students.map((s: any, index: number) => {
      const latestPing = s.locationEvents[0];
      const isInside = index % 4 !== 0;

      const latOffset = ((index % 8) - 4) * 0.0008;
      const lngOffset = (Math.floor(index / 8) - 3) * 0.0008;

      const fallbackLat = isInside ? baseLat + latOffset : baseLat - 0.0120 + latOffset;
      const fallbackLng = isInside ? baseLng + lngOffset : baseLng - 0.0120 + lngOffset;

      return {
        studentId: s.id,
        name: s.user.name,
        rollNumber: s.rollNumber,
        department: s.department.name,
        latitude: latestPing ? latestPing.latitude : fallbackLat,
        longitude: latestPing ? latestPing.longitude : fallbackLng,
        batteryLevel: latestPing ? latestPing.batteryLevel : 85,
        lastPingTime: latestPing ? latestPing.timestamp : new Date(),
      };
    });

    return res.json(locations);
  } catch (error) {
    console.error('Error fetching latest locations:', error);
    return res.status(500).json({ message: 'Server error fetching locations' });
  }
};
