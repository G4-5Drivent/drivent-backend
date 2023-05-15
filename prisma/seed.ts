import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';
const prisma = new PrismaClient();

async function main() {
  let event = await prisma.event.findFirst();
  if (!event) {
    event = await prisma.event.create({
      data: {
        title: 'Driven.t',
        logoImageUrl: 'https://files.driveneducation.com.br/images/logo-rounded.png',
        backgroundImageUrl: 'linear-gradient(to right, #FA4098, #FFD77F)',
        startsAt: dayjs().toDate(),
        endsAt: dayjs().add(21, 'days').toDate(),
      },
    });
  }

  let hotel = await prisma.hotel.findFirst();
  if (!hotel) {
    await prisma.hotel.create({
      data: {
        name: 'Hotel Driven',
        image:
          'https://www.gannett-cdn.com/-mm-/05b227ad5b8ad4e9dcb53af4f31d7fbdb7fa901b/c=0-64-2119-1259/local/-/media/USATODAY/USATODAY/2014/08/13/1407953244000-177513283.jpg',
        updatedAt: dayjs().toDate(),
      },
    });
  }
  hotel = await prisma.hotel.findFirst();

  const room = await prisma.room.findFirst();
  if (!room && hotel) {
    await prisma.room.create({
      data: {
        name: '102',
        capacity: 2,
        roomType: 'DOUBLE',
        hotelId: hotel.id,
        updatedAt: dayjs().toDate(),
      },
    });
  }

  console.log({ EVENT: event }, { HOTEL: hotel }, { ROOM: room });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
