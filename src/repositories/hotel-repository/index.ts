import { prisma } from '@/config';

interface HotelInfo {
  capacity: number;
  roomKinds: string[];
}

async function findHotels() {
  return prisma.hotel.findMany({
    include: {
      Rooms: {
        select: {
          capacity: true,
          roomKind: true,
        },
      },
    },
  });
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

const hotelRepository = {
  findHotels,
  findRoomsByHotelId,
};

export default hotelRepository;
