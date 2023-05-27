import faker from '@faker-js/faker';
import { Place } from '@prisma/client';
import { prisma } from '@/config';

export function createPlace(params: Partial<Place> = {}): Promise<Place> {
  return prisma.place.create({
    data: {
      name: params.name || faker.lorem.word(),
      capacity: params.capacity || faker.datatype.number(),
    },
  });
}

export function createPlaceWithoutCapacity(params: Partial<Place> = {}): Promise<Place> {
  return prisma.place.create({
    data: {
      name: params.name || faker.lorem.word(),
      capacity: 0,
    },
  });
}
