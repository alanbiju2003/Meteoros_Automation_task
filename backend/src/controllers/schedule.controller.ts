import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';

export const getClassSchedule = async (req: Request, res: Response) => {
  try {
    const currentHour = new Date().getHours();

    const scheduleData = [
      {
        code: 'CSE301',
        title: 'Distributed Systems & Cloud Architecture',
        time: '09:00 AM - 11:00 AM',
        room: 'Room 302, Eng Block A',
        instructor: 'Dr. Ramesh Kumar',
        status: currentHour >= 11 ? 'Completed' : currentHour >= 9 ? 'Ongoing' : 'Upcoming',
      },
      {
        code: 'CSE302',
        title: 'Database Systems (PostgreSQL & TimescaleDB)',
        time: '11:15 AM - 01:15 PM',
        room: 'Lab 4, Computer Center',
        instructor: 'Prof. Ananya Sen',
        status: currentHour >= 14 ? 'Completed' : currentHour >= 11 ? 'Ongoing' : 'Upcoming',
      },
      {
        code: 'CSE303',
        title: 'Operating Systems & System Programming',
        time: '02:00 PM - 04:00 PM',
        room: 'Room 105, Eng Block A',
        instructor: 'Dr. Suresh V',
        status: currentHour >= 16 ? 'Completed' : currentHour >= 14 ? 'Ongoing' : 'Upcoming',
      },
      {
        code: 'CSE304',
        title: 'Artificial Intelligence & Neural Networks',
        time: '04:15 PM - 06:00 PM',
        room: 'Room 201, Eng Block B',
        instructor: 'Dr. Meera Nair',
        status: currentHour >= 18 ? 'Completed' : currentHour >= 16 ? 'Ongoing' : 'Upcoming',
      },
    ];

    return res.json(scheduleData);
  } catch (error) {
    console.error('Error fetching class schedule:', error);
    return res.status(500).json({ message: 'Server error fetching class schedule' });
  }
};
