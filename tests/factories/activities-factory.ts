import dayjs from 'dayjs';
import faker from '@faker-js/faker';
import { Activity } from '@prisma/client';
import { createPlace } from './place-factory';
import { createActivityEnrollment } from './activityEnrollment-factory';
import { prisma } from '@/config';

export async function createActivity(): Promise<Activity> {
  const place = await createPlace();
  return prisma.activity.create({
    data: {
      name: faker.lorem.word(),
      placeId: place.id,
      startsAt: dayjs().subtract(1, 'day').toDate(),
      endsAt: dayjs().add(5, 'days').toDate(),
    },
  });
}

export async function createActivityWithPlaceId(placeId: number): Promise<Activity> {
  return prisma.activity.create({
    data: {
      name: faker.lorem.word(),
      placeId: placeId,
      startsAt: dayjs().subtract(1, 'day').toDate(),
      endsAt: dayjs().add(5, 'days').toDate(),
    },
  });
}

export async function createActivityAtSameTime(startsAt: Date, endsAt: Date): Promise<Activity> {
  const place = await createPlace();
  return prisma.activity.create({
    data: {
      name: faker.lorem.word(),
      placeId: place.id,
      startsAt: startsAt,
      endsAt: endsAt,
    },
  });
}
