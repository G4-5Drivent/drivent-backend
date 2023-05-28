import { Activity, PrismaClient, Room } from '@prisma/client';
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
    hotel = await prisma.hotel.create({
      data: {
        name: 'Hotel Driven',
        image:
          'https://www.gannett-cdn.com/-mm-/05b227ad5b8ad4e9dcb53af4f31d7fbdb7fa901b/c=0-64-2119-1259/local/-/media/USATODAY/USATODAY/2014/08/13/1407953244000-177513283.jpg',
        updatedAt: dayjs().toDate(),
      },
    });
  }

  let rooms = await prisma.room.findFirst();
  let newRooms;
  if (!rooms) {
    await prisma.room.createMany({
      data: [
        {
          name: '102',
          capacity: 1,
          roomType: 'SINGLE',
          hotelId: hotel.id,
          updatedAt: dayjs().toDate(),
        },
        {
          name: '103',
          capacity: 2,
          roomType: 'DOUBLE',
          hotelId: hotel.id,
          updatedAt: dayjs().toDate(),
        },
        {
          name: '104',
          capacity: 3,
          roomType: 'TRIPLE',
          hotelId: hotel.id,
          updatedAt: dayjs().toDate(),
        },
      ],
    });
  }
  newRooms = await prisma.room.findMany({});

  let places = await prisma.place.findFirst();
  let newPlaces;
  if (!places) {
    await prisma.place.createMany({
      data: [
        {
          name: 'Auditório Principal',
          capacity: 50,
          updatedAt: dayjs().toDate(),
        },
        {
          name: 'Sala de Reuniões 3',
          capacity: 10,
          updatedAt: dayjs().toDate(),
        },
        {
          name: 'Sala de Workshop',
          capacity: 30,
          updatedAt: dayjs().toDate(),
        },
      ],
    });
  }
  newPlaces = await prisma.place.findMany({});

  let activities = await prisma.activity.findFirst();
  let newActivities;
  if (!activities) {
    const currentTime = dayjs().startOf('day').add(9, 'hour');

    await prisma.activity.createMany({
      data: getActivities(),
    });
  }
  newActivities = await prisma.activity.findMany({});

  console.log(
    { EVENT: event },
    { HOTEL: hotel },
    { ROOMS: newRooms },
    { PLACES: newPlaces },
    { ACTIVITIES: newActivities },
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

function getActivities() {
  const days = 3;
  const dayToSet = dayjs('2023-06-02');
  const currentTime = dayToSet.startOf('day').add(9, 'hour');

  const activityNames = [
    'Conference Talk',
    'Workshop',
    'Panel Discussion',
    'Keynote Speech',
    'Networking Event',
    'Training Session',
    'Hackathon',
    'Seminar',
    'Product Demo',
    'Team Building Exercise',
    'Q&A Session',
    'Industry Panel',
    'Roundtable Discussion',
    'Presentation',
    'Tutorial',
  ];

  const arr: any = [];

  for (let i = 0; i < days; i++) {
    const activityDate = currentTime.add(i, 'day');
    arr.push({
      name: activityNames[Math.floor(Math.random() * activityNames.length)],
      startsAt: activityDate.toDate(),
      endsAt: activityDate.add(1 + Math.floor(Math.random() * 3), 'hour').toDate(),
      placeId: 1,
      updatedAt: dayjs().toDate(),
    });
    arr.push({
      name: activityNames[Math.floor(Math.random() * activityNames.length)],
      startsAt: activityDate.add(1, 'hour').toDate(),
      endsAt: activityDate.add(2 + Math.floor(Math.random() * 3), 'hour').toDate(),
      placeId: 1,
      updatedAt: dayjs().toDate(),
    });
    arr.push({
      name: activityNames[Math.floor(Math.random() * activityNames.length)],
      startsAt: activityDate.toDate(),
      endsAt: activityDate.add(1 + Math.floor(Math.random() * 3), 'hour').toDate(),
      placeId: 2,
      updatedAt: dayjs().toDate(),
    });
    arr.push({
      name: activityNames[Math.floor(Math.random() * activityNames.length)],
      startsAt: activityDate.toDate(),
      endsAt: activityDate.add(1 + Math.floor(Math.random() * 3), 'hour').toDate(),
      placeId: 3,
      updatedAt: dayjs().toDate(),
    });
    arr.push({
      name: activityNames[Math.floor(Math.random() * activityNames.length)],
      startsAt: activityDate.add(4, 'hour').toDate(),
      endsAt: activityDate.add(5 + Math.floor(Math.random() * 3), 'hour').toDate(),
      placeId: 3,
      updatedAt: dayjs().toDate(),
    });
  }

  return arr;
}
