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

export async function getActivityById(id: number) {
  return await prisma.activity.findUnique({
    where: {
      id,
    },
  });
}

export async function getActivityEnrollmentsById(activityId: number) {
  return await prisma.activityEnrollment.findMany({
    where: {
      activityId,
    },
  });
}

export async function getUserActivityEnrollmendById(activityId: number, userId: number) {
  return await prisma.activityEnrollment.findFirst({
    where: {
      activityId,
      userId,
    },
  });
}

export async function subscribeToActivity(userId: number, activityId: number) {
  return await prisma.activityEnrollment.create({
    data: {
      userId,
      activityId,
    },
  });
}

export async function getPlaceById(id: number) {
  return await prisma.place.findUnique({
    where: {
      id,
    },
  });
}

export async function unsubscribeToActivity(activityId: number, userId: number) {
  return await prisma.activityEnrollment.deleteMany({
    where: {
      activityId,
      userId,
    },
  });
}
