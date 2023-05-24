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
