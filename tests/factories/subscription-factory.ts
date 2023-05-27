import { prisma } from '@/config';

export async function createSubscription(userId: number, activityId: number) {
  return prisma.activityEnrollment.create({
    data: {
      userId: userId,
      activityId: activityId,
    },
  });
}
