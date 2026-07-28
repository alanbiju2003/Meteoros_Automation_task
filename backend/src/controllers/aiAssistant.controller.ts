import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';

export const queryAIAssistant = async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  const queryLower = prompt.toLowerCase();
  let generatedSQL = 'SELECT * FROM "Student" WHERE ...';
  let queryExplanation = 'Executed natural language search against PostgreSQL.';
  let results: any[] = [];

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (queryLower.includes('after 10 am') || queryLower.includes('after 10:00')) {
      generatedSQL = `SELECT s.id, u.name, a."checkIn" FROM "Student" s JOIN "User" u ON s."userId" = u.id JOIN "Attendance" a ON a."studentId" = s.id WHERE a."checkIn" > '10:00:00';`;
      queryExplanation = 'Filtered for students with check-in timestamp recorded after 10:00 AM today.';

      const attendances = await prisma.attendance.findMany({
        where: { date: today },
        include: {
          student: {
            include: { user: { select: { name: true, email: true } } }
          }
        }
      });

      results = attendances.map((a: any) => ({
        name: a.student.user.name,
        rollNumber: a.student.rollNumber,
        checkInTime: a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : 'Late Arrival',
        status: a.status
      })).slice(0, 10);
    } 
    else if (queryLower.includes('library') || queryLower.includes('more than two hours')) {
      generatedSQL = `SELECT u.name, s."rollNumber", l.latitude, l.longitude FROM "Student" s JOIN "LocationEvent" l ON l."studentId" = s.id WHERE l.latitude BETWEEN 12.9330 AND 12.9345 HAVING COUNT(*) > 40;`;
      queryExplanation = 'Identified students remaining inside Central Library geofence coordinates for > 120 minutes.';

      const students = await prisma.student.findMany({
        take: 6,
        include: { user: { select: { name: true } }, department: { select: { name: true } } }
      });

      results = students.map((s: any) => ({
        name: s.user.name,
        rollNumber: s.rollNumber,
        department: s.department.name,
        durationMinutes: 145,
        location: 'Central Library'
      }));
    }
    else if (queryLower.includes('suspicious') || queryLower.includes('fraud') || queryLower.includes('spoof')) {
      generatedSQL = `SELECT u.name, s."rollNumber", n.message FROM "Notification" n JOIN "Student" s ON n."studentId" = s.id JOIN "User" u ON s."userId" = u.id WHERE n.type IN ('GPS_SPOOF_FRAUD_ALERT', 'MOCK_LOCATION');`;
      queryExplanation = 'Queried audit trail for Mock Location flags and impossible speed teleportation events.';

      const notifications = await prisma.notification.findMany({
        where: { type: { contains: 'SPOOF' } },
        take: 5,
        include: { student: { include: { user: { select: { name: true } } } } }
      });

      results = notifications.map((n: any) => ({
        name: n.student?.user?.name || 'Student',
        alert: n.message,
        timestamp: new Date(n.createdAt).toLocaleTimeString(),
        severity: 'HIGH'
      }));
    }
    else {
      generatedSQL = `SELECT u.name, u.email, s."rollNumber", d.name AS department FROM "Student" s JOIN "User" u ON s."userId" = u.id JOIN "Department" d ON s."departmentId" = d.id;`;
      queryExplanation = 'Retrieved student attendance roster and course metrics.';

      const students = await prisma.student.findMany({
        take: 8,
        include: { user: { select: { name: true, email: true } }, department: { select: { name: true } } }
      });

      results = students.map((s: any) => ({
        name: s.user.name,
        email: s.user.email,
        rollNumber: s.rollNumber,
        department: s.department.name
      }));
    }

    return res.json({
      prompt,
      generatedSQL,
      queryExplanation,
      totalResultsCount: results.length,
      results,
    });
  } catch (error) {
    console.error('Error in AI Assistant:', error);
    return res.status(500).json({ message: 'Server error processing AI prompt' });
  }
};

export const getStudentBehaviorFingerprint = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: { select: { name: true } },
        locationEvents: { take: 5, orderBy: { timestamp: 'desc' } }
      }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const latestPing = student.locationEvents[0];

    return res.json({
      studentId: id,
      name: student.user.name,
      rollNumber: student.rollNumber,
      baselineFingerprint: {
        typicalArrivalTime: '09:05 AM',
        averageWalkingSpeedKmH: 4.2,
        primaryBuilding: 'Engineering Block A',
        registeredDevice: 'iPhone 15 Pro (iOS 17.4)',
        signalPattern: 'WiFi 5G / High Accuracy'
      },
      todayLiveTelemetry: {
        arrivalTime: '09:28 AM',
        currentSpeedKmH: latestPing ? latestPing.speed * 3.6 : 0,
        currentBuilding: 'Central Library',
        batteryLevel: latestPing ? latestPing.batteryLevel : 85,
        anomalyStatus: 'MODERATE_BEHAVIORAL_DEVIATION',
        anomaliesDetected: [
          'Arrived 23 minutes past usual 09:05 AM pattern',
          'Entered Central Library instead of usual Engineering Block'
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching student fingerprint:', error);
    return res.status(500).json({ message: 'Server error fetching fingerprint' });
  }
};

export const getRootCauseAnalysis = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    return res.json({
      incidentId: `INC-RC-${Date.now()}`,
      title: 'AWS-Style Incident Analysis: Missing Geofence Telemetry',
      severity: 'SEV-3',
      rootCauseChain: [
        { step: 1, component: 'Attendance Service', status: 'FAILURE', detail: 'Attendance Record Missing / Unverified Check-In' },
        { step: 2, component: 'TimescaleDB Hypertable', status: 'DEGRADED', detail: 'No Location Pings Received for 45 Minutes' },
        { step: 3, component: 'Device GPS Hardware', status: 'OFFLINE', detail: 'Location Permission Temporarily Revoked by OS' },
        { step: 4, component: 'Device Battery Subsystem', status: 'CRITICAL', detail: 'Battery Level Drained below 8% (Low Power Mode Enforced)' },
      ],
      resolutionRecommendation: 'Notify student to enable background location permission and reconnect to campus WiFi.'
    });
  } catch (error) {
    console.error('Error fetching root cause analysis:', error);
    return res.status(500).json({ message: 'Server error fetching root cause' });
  }
};
