import 'dayjs/locale/pt';
import dayjs from 'dayjs';
import ticketService from '../tickets-service';
import { badRequestError } from '@/errors/bad-request-error';
import * as activityRepository from '@/repositories/activities-repository';
import { notFoundError } from '@/errors';
import { forBiddenError } from '@/errors/forbidden-error';

async function checkUserAccessToActivities(userId: number) {
  const userTicket = await ticketService.getTicketByUserId(userId);

  if (!userTicket) throw notFoundError();

  if (userTicket.status !== 'PAID') throw forBiddenError();

  const ticketTypes = await ticketService.getTicketType();
  const ticketType = ticketTypes.find((type) => type.id === userTicket.ticketTypeId);

  if (!ticketType) throw Error('Ticket types not found');

  if (!ticketType.includesHotel || ticketType.isRemote) throw forBiddenError();
}

async function getActivitiesByDay(userId: number, date: string) {
  if (!date) throw badRequestError();

  await checkUserAccessToActivities(userId);

  const targetDate = dayjs(date, 'YYYY-MM-DD');
  if (!targetDate.isValid()) throw badRequestError();

  return activityRepository.getActivitiesByDay(targetDate);
}

interface ActivityDay {
  date: string;
  day: string;
}

async function getActivityDays(userId: number) {
  await checkUserAccessToActivities(userId);

  const days = await activityRepository.getDayActivities();

  const uniqueDays: ActivityDay[] = [];

  days.forEach((day) => {
    const newDay = {
      date: dayjs(day.startsAt).format('YYYY-MM-DD'),
      day: dayjs(day.startsAt).locale('pt').format('dddd'),
    };

    if (!uniqueDays.find((uniqueDay) => uniqueDay.date === newDay.date)) {
      uniqueDays.push(newDay);
    }
  });

  return uniqueDays;
}

async function subscribeToActivity(userId: number, activityId: number) {
  await checkUserAccessToActivities(userId);

  return await activityRepository.subscribeToActivity(userId, activityId);
}

// async function checkActivityAvailability(activityId: number) {
//   const activity = await activityRepository.getActivityById(activityId);

//   if (!activity) throw notFoundError();

//   const activityEnrollments = await activityRepository.getActivityEnrollments(activityId);

//   if (activityEnrollments.length >= activity.capacity) throw forBiddenError();
// }

const activityService = {
  getActivitiesByDay,
  getActivityDays,
};

export default activityService;
