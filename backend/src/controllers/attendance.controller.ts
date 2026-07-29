import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { getHaversineDistance } from '../utils/geofence.js';

const CAMPUS_LAT = 12.9337;
const CAMPUS_LNG = 77.6051;
const GEOFENCE_RADIUS_METERS = 500;

export const checkIn = async (req: Request, res: Response) => {
  const { studentId, latitude, longitude, isQrCheckIn, overrideGeofence } = req.body;

  if (!studentId) {
    return res.status(400).json({ message: 'studentId is required' });
  }

  try {
    const lat = latitude ? parseFloat(latitude) : CAMPUS_LAT;
    const lng = longitude ? parseFloat(longitude) : CAMPUS_LNG;

    // Calculate exact distance from campus center
    const distanceMeters = Math.round(getHaversineDistance(lat, lng, CAMPUS_LAT, CAMPUS_LNG));
    const isInsideGeofence = distanceMeters <= GEOFENCE_RADIUS_METERS;

    // QR Code Backup Check-In or Manual Override allows check-in regardless of distance
    const isApprovedCheckIn = isInsideGeofence || isQrCheckIn || overrideGeofence;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();

    const attendanceStatus = isApprovedCheckIn ? 'Present' : 'Checked Out';

    const attendance = await prisma.attendance.upsert({
      where: {
        studentId_date: {
          studentId,
          date: today,
        },
      },
      update: {
        checkIn: now,
        checkOut: null,
        status: 'Present',
      },
      create: {
        studentId,
        date: today,
        checkIn: now,
        checkOut: null,
        status: 'Present',
      },
    });

    // Create Notification Log
    await prisma.notification.create({
      data: {
        studentId,
        type: isQrCheckIn ? 'QR_CODE_CHECK_IN' : (isInsideGeofence ? 'AUTO_CHECK_IN' : 'MANUAL_CHECK_IN'),
        message: isQrCheckIn
          ? 'QR Code Verified Backup Check-In Successful! Marked Present.'
          : (isInsideGeofence
              ? `Auto Checked-In! Distance: ${distanceMeters}m (Within Geofence). Marked Present.`
              : `Manual Check-In Logged! Distance: ${distanceMeters}m. Marked Present.`),
      },
    });

    // Save Location Event to TimescaleDB
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
      message: 'Check-In Logged Successfully! Status: Present',
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
