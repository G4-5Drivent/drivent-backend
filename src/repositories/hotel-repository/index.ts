import { prisma } from '@/config';

async function findHotels() {
  return prisma.hotel.findMany();
}

async function findRoomsByHotelId(hotelId: number) {
  return prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
    include: {
      Rooms: true,
    },
  });
}

async function findHotelsInfo() {
  return prisma.hotel.findMany({
    select: {
      id: true,
      name: true,
      Rooms: {
        select: {
          capacity: true,
          roomKind: true,
        },
      },
    },
  });
}

const hotelRepository = {
  findHotels,
  findRoomsByHotelId,
  findHotelsInfo,
};

export default hotelRepository;
