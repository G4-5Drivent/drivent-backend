import { Dayjs } from 'dayjs';
import { prisma } from '@/config';
import { notFoundError } from '@/errors';
import ticketService from '@/services/tickets-service';

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

export async function subscribeToActivity(userId: number, activityId: number) {
  const activity = await prisma.activity.findUnique({
    where: {
      id: activityId,
    },
  });

  if (!activity) throw notFoundError();

  if (userTicket.status !== 'PAID') throw Error('Ticket not paid');

  const ticketType = await prisma.ticketType.findUnique({
    where: {
      id: userTicket.ticketTypeId,
    },
  });

  if (!ticketType) throw Error('Ticket type not found');

  if (!ticketType.includesHotel || ticketType.isRemote) throw Error('Ticket type not allowed');

  const activitySubscription = await prisma.activitySubscription.findUnique({
    where: {
      userId_activityId: {
        userId,
        activityId,
      },
    },
  });

  if (activitySubscription) throw Error('User already subscribed to activity');

  return await prisma.activitySubscription.create({
    data: {
      userId,
      activityId,
    },
  });
}
