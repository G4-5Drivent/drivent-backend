import { Dayjs } from 'dayjs';
import { prisma } from '@/config';

export async function getActivitiesByDay(targetDate: Dayjs) {
  const activities = await prisma.activity.findMany({
    where: {
      startsAt: {
        gte: targetDate.startOf('day').toDate(),
        lt: targetDate.endOf('day').toDate(),
      },
    },
  });
  return activities;
}

export async function getDayActivities() {
  return await prisma.activity.findMany({
    select: {
      startsAt: true,
    },
    distinct: ['startsAt'],
  });
}

export async function getActivities() {
  return await prisma.activity.findMany();
}
