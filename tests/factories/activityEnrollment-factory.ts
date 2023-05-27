import { ActivityEnrollment } from '@prisma/client';
import { prisma } from '@/config';

export function createActivityEnrollment(userId: number, activityId: number): Promise<ActivityEnrollment> {
  return prisma.activityEnrollment.create({
    data: {
      userId: userId,
      activityId: activityId,
    },
  });
}
