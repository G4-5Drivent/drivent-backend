import { prisma, redis } from '@/config';

async function findFirst() {
  const cacheKey = 'event';
  const cachedEvent = await redis.get(cacheKey);

  if (cachedEvent) {
    console.log('RECEBENDO DO CACHE DO REDIS');
    const event = JSON.parse(cachedEvent);
    return event;
  }

  const event = await prisma.event.findFirst();

  redis.setEx(cacheKey, 60, JSON.stringify(event));

  return event;
}

const eventRepository = {
  findFirst,
};

export default eventRepository;
