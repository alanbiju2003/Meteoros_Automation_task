import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { getHaversineDistance } from '../utils/geofence.js';

const CAMPUS_LAT = 12.9337;
const CAMPUS_LNG = 77.6051;
const GEOFENCE_RADIUS_METERS = 500;

export const checkIn = async (req: Request, res: Response) => {
  const { studentId, latitude, longitude } = req.body;

  if (!studentId) {
    return res.status(400).json({ message: 'studentId is required' });
  }

  try {
    const lat = latitude ? parseFloat(latitude) : CAMPUS_LAT;
    const lng = longitude ? parseFloat(longitude) : CAMPUS_LNG;

    // Calculate exact distance from campus center
    const distanceMeters = Math.round(getHaversineDistance(lat, lng, CAMPUS_LAT, CAMPUS_LNG));
    const isInsideGeofence = distanceMeters <= GEOFENCE_RADIUS_METERS;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();

    const attendanceStatus = isInsideGeofence ? 'Present' : 'Checked Out';

    const attendance = await prisma.attendance.upsert({
      where: {
        studentId_date: {
          studentId,
          date: today,
        },
      },
      update: {
        checkIn: isInsideGeofence ? now : undefined,
        checkOut: isInsideGeofence ? null : now,
        status: attendanceStatus,
      },
      create: {
        studentId,
        date: today,
        checkIn: isInsideGeofence ? now : null,
        checkOut: isInsideGeofence ? null : now,
        status: attendanceStatus,
      },
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        studentId,
        type: isInsideGeofence ? 'AUTO_CHECK_IN' : 'AUTO_CHECK_OUT',
        message: isInsideGeofence
          ? `Auto Checked-In! Distance from campus center: ${distanceMeters}m (Within 500m Geofence).`
          : `Auto Checked-Out! Distance from campus center: ${distanceMeters}m (Outside 500m Geofence).`,
      },
    });

    // Save to TimescaleDB
    await prisma.locationEvent.create({
      data: {
        studentId,
        latitude: lat,
        longitude: lng,
        accuracy: 3.5,
        speed: 0,
        batteryLevel: 88,
        networkType: 'WiFi 5G',
        gpsEnabled: true,
        timestamp: now,
      },
    });

    return res.json({
      message: isInsideGeofence ? 'Auto Checked-In Successful' : 'Auto Checked-Out (Far from Campus)',
      distanceMeters,
      isInsideGeofence,
      attendance,
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return res.status(500).json({ message: 'Server error during check-in' });
  }
};

export const checkOut = async (req: Request, res: Response) => {
  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ message: 'studentId is required' });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();

    const existing = await prisma.attendance.findUnique({
      where: {
        studentId_date: {
          studentId,
          date: today,
        },
      },
    });

    let durationMinutes = 0;
    if (existing?.checkIn) {
      const diffMs = now.getTime() - new Date(existing.checkIn).getTime();
      durationMinutes = Math.round(diffMs / (1000 * 60));
    }

    const attendance = await prisma.attendance.update({
      where: {
        studentId_date: {
          studentId,
          date: today,
        },
      },
      data: {
        checkOut: now,
        status: 'Checked Out',
        duration: durationMinutes,
      },
    });

    await prisma.notification.create({
      data: {
        studentId,
        type: 'CHECK_OUT',
        message: 'Checked out of campus. Total stay duration logged.',
      },
    });

    return res.json({ message: 'Check-out successful', attendance });
  } catch (error) {
    console.error('Check-out error:', error);
    return res.status(500).json({ message: 'Server error during check-out' });
  }
};

export const getAttendanceHistory = async (req: Request, res: Response) => {
  const { studentId } = req.query;

  try {
    const history = await prisma.attendance.findMany({
      where: studentId ? { studentId: String(studentId) } : {},
      orderBy: { date: 'desc' },
      take: 30,
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    return res.json(history);
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    return res.status(500).json({ message: 'Server error fetching history' });
  }
};
