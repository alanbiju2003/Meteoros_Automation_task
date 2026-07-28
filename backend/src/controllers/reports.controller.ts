import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';

export const generateReport = async (req: Request, res: Response) => {
  const { department, format } = req.query;

  try {
    const students = await prisma.student.findMany({
      where: department && department !== 'all' ? {
        department: { name: { contains: String(department), mode: 'insensitive' } }
      } : {},
      include: {
        user: { select: { name: true, email: true } },
        department: { select: { name: true } },
        course: { select: { name: true } },
        attendances: { take: 1, orderBy: { date: 'desc' } }
      }
    });

    const reportData = students.map((s: any) => ({
      name: s.user.name,
      email: s.user.email,
      rollNumber: s.rollNumber,
      department: s.department.name,
      course: s.course.name,
      year: s.year,
      latestStatus: s.attendances[0]?.status || 'Absent',
      checkIn: s.attendances[0]?.checkIn ? new Date(s.attendances[0].checkIn).toLocaleTimeString() : 'N/A',
      checkOut: s.attendances[0]?.checkOut ? new Date(s.attendances[0].checkOut).toLocaleTimeString() : 'N/A'
    }));

    if (format === 'csv') {
      const headers = ['Name', 'Email', 'Roll Number', 'Department', 'Course', 'Year', 'Status', 'Check In', 'Check Out'];
      const rows = reportData.map((r: any) => [
        `"${r.name}"`,
        `"${r.email}"`,
        `"${r.rollNumber}"`,
        `"${r.department}"`,
        `"${r.course}"`,
        r.year,
        `"${r.latestStatus}"`,
        `"${r.checkIn}"`,
        `"${r.checkOut}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map((row: any) => row.join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=attendance_report_${Date.now()}.csv`);
      return res.status(200).send(csvContent);
    }

    return res.json(reportData);
  } catch (error) {
    console.error('Error generating report:', error);
    return res.status(500).json({ message: 'Server error generating report' });
  }
};
