import dayjs from 'dayjs';
import ticketService from '../tickets-service';
import { badRequestError } from '@/errors/bad-request-error';
import * as activityRepository from '@/repositories/activities-repository';
import { notFoundError } from '@/errors';
import { forBiddenError } from '@/errors/forbidden-error';

async function checkUserAccessToActivities(userId: number) {
  const userTicket = await ticketService.getTicketByUserId(userId);

  if (!userTicket) throw notFoundError();

  if (userTicket.status !== 'RESERVED') throw forBiddenError();

  const ticketTypes = await ticketService.getTicketType();
  const ticketType = ticketTypes.find((type) => type.id === userTicket.ticketTypeId);
  if (!ticketType) throw Error('Ticket type not found');
  if (!ticketType.includesHotel || ticketType.isRemote) throw forBiddenError();
}

export async function getActivitiesByDay(userId: number, date: string) {
  await checkUserAccessToActivities(userId);

  const targetDate = dayjs(date);

  if (!targetDate.isValid()) throw badRequestError();

  return activityRepository.getActivitiesByDay(targetDate);
}
