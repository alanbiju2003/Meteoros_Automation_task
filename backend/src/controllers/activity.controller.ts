import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';

export const getActivityFeed = async (req: Request, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    const formattedEvents = notifications.map((n: any) => ({
      id: n.id,
      type: n.type,
      title: `${n.student?.user?.name || 'Student'} - ${n.type.replace('_', ' ')}`,
      description: n.message,
      time: new Date(n.createdAt).toLocaleTimeString(),
      timestamp: n.createdAt,
    }));

    return res.json(formattedEvents);
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    return res.status(500).json({ message: 'Server error fetching activity' });
  }
};
