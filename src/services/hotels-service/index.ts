import hotelRepository from '@/repositories/hotel-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import { notFoundError } from '@/errors';
import ticketsRepository from '@/repositories/tickets-repository';
import { cannotListHotelsError } from '@/errors/cannot-list-hotels-error';

async function listHotels(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === 'RESERVED' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw cannotListHotelsError();
  }
}

async function getHotels(userId: number) {
  // await listHotels(userId);

  const hotels = await hotelRepository.findHotels();
  if (!hotels || hotels.length === 0) {
    throw notFoundError();
  }

  const formattedHotels = hotels.map((hotel) => {
    const hotelCapacity = hotel.Rooms.reduce((sum, room) => sum + room.capacity, 0);

    const roomKinds = [...new Set(hotel.Rooms.flatMap((room) => room.roomKind))];

    return {
      id: hotel.id,
      name: hotel.name,
      image: hotel.image,
      createdAt: hotel.createdAt,
      updatedAt: hotel.updatedAt,
      capacity: hotelCapacity,
      roomKinds: roomKinds.join(', '),
    };
  });
  return formattedHotels;
}

async function getHotelsWithRooms(userId: number, hotelId: number) {
  // await listHotels(userId);

  const hotel = await hotelRepository.findRoomsByHotelId(hotelId);

  if (!hotel || hotel.Rooms.length === 0) {
    throw notFoundError();
  }
  return hotel;
}

export default {
  getHotels,
  getHotelsWithRooms,
  listHotels,
};