import dayjs from 'dayjs';
import ticketService from '../tickets-service';
import { badRequestError } from '@/errors/bad-request-error';
import * as activityRepository from '@/repositories/activities-repository';
import { notFoundError } from '@/errors';
import { forBiddenError } from '@/errors/forbidden-error';

export async function getActivitiesByDay(userId: number, date: string) {
  const userTicket = await ticketService.getTicketByUserId(userId);

  if (!userTicket) throw notFoundError();

  if (userTicket.status !== 'RESERVED') throw forBiddenError();

  const ticketTypes = await ticketService.getTicketType();
  const ticketType = ticketTypes.find((type) => type.id === userTicket.ticketTypeId);
  if (!ticketType) throw Error('Ticket type not found');
  if (!ticketType.includesHotel || ticketType.isRemote) throw forBiddenError();

  const targetDate = dayjs(date);

  if (!date.isValid()) throw badRequestError();

  return activityRepository.getActivitiesByDay(targetDate);
}
