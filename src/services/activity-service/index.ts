import 'dayjs/locale/pt';
import dayjs from 'dayjs';
import ticketService from '../tickets-service';
import { badRequestError } from '@/errors/bad-request-error';
import * as activityRepository from '@/repositories/activities-repository';
import { conflictError, notFoundError } from '@/errors';
import { forBiddenError } from '@/errors/forbidden-error';
import { ActivityFullCapacityError } from '@/errors/activity-full-capacity-error';

async function getActivitiesByDate(userId: number, date: string) {
  if (!date) throw badRequestError();

  await checkUserAccessToActivities(userId);

  const targetDate = dayjs(date, 'YYYY-MM-DD');
  if (!targetDate.isValid()) throw badRequestError();

  const activities = await activityRepository.getActivitiesByDay(targetDate);

  const formattedActivities = activities.map((activity) => {
    const formattedActivity = {
      ...activity,
      startsAt: dayjs(activity.startsAt).format('HH:mm'),
      endsAt: dayjs(activity.endsAt).format('HH:mm'),
      date: dayjs(activity.startsAt).format('YYYY-MM-DD'),
    };

    return formattedActivity;
  });

  return formattedActivities;
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
  if (!userId || !activityId) throw badRequestError();

  await checkUserAccessToActivities(userId);
  await checkUserAlreadySubscribed(activityId, userId);
  await checkActivityAvailability(activityId);
  await checkActivitiesTimeConflict(activityId, userId);

  return await activityRepository.subscribeToActivity(userId, activityId);
}

async function unsubscribeToActivity(userId: number, activityId: number) {
  if (!userId || !activityId) throw badRequestError();

  await checkUserAccessToActivities(userId);
  await checkUserActivityOwnship(activityId, userId);

  return await activityRepository.unsubscribeToActivity(userId, activityId);
}

async function getDatePlacesAndActivities(userId: number, date: string) {
  if (!date) throw badRequestError();

  await checkUserAccessToActivities(userId);

  const targetDate = dayjs(date, 'YYYY-MM-DD');
  if (!targetDate.isValid()) throw badRequestError();

  const places = await activityRepository.getDatePlacesAndActivities(targetDate);

  const formattedPlaces = places.map((place) => {
    const formattedPlace = {
      id: place.id,
      name: place.name,

      activities: place.Activity.map((activity) => {
        const formattedActivity = {
          id: activity.id,
          name: activity.name,
          placeId: activity.placeId,
          startsAt: dayjs(activity.startsAt).format('HH:mm'),
          endsAt: dayjs(activity.endsAt).format('HH:mm'),
          spotsAvailable: place.capacity - activity.ActivityEnrollment.length,
        };

        return formattedActivity;
      }),
    };

    return formattedPlace;
  });

  return formattedPlaces;
}

const activityService = {
  getActivitiesByDate,
  getActivityDays,
  subscribeToActivity,
  unsubscribeToActivity,
  getDatePlacesAndActivities,
};

export default activityService;

async function checkUserAccessToActivities(userId: number) {
  const userTicket = await ticketService.getTicketByUserId(userId);
  if (!userTicket) throw notFoundError();

  if (userTicket.status !== 'PAID') throw forBiddenError();

  const ticketTypes = await ticketService.getTicketType();
  const ticketType = ticketTypes.find((type) => type.id === userTicket.ticketTypeId);

  if (!ticketType) throw Error('Ticket types not found');

  if (!ticketType.includesHotel || ticketType.isRemote) throw forBiddenError();
}

async function checkUserActivityOwnship(activityId: number, userId: number) {
  const activityEnrollment = await activityRepository.getUserActivityEnrollmendById(activityId, userId);
  if (!activityEnrollment) throw notFoundError();
  if (activityEnrollment.userId !== userId) throw forBiddenError();
}

async function checkActivityAvailability(activityId: number) {
  const activity = await activityRepository.getActivityById(activityId);

  if (!activity) throw notFoundError();

  const placeCapacity = await activityRepository.getPlaceById(activity.placeId);

  const activityEnrollments = await activityRepository.getActivityEnrollmentsById(activityId);

  if (activityEnrollments.length >= placeCapacity.capacity) throw ActivityFullCapacityError();
}

async function checkUserAlreadySubscribed(activityId: number, userId: number) {
  const activityEnrollment = await activityRepository.getUserActivityEnrollmendById(activityId, userId);
  if (activityEnrollment) throw conflictError('User already subscribed to activity');
}

async function checkActivitiesTimeConflict(activityId: number, userId: number) {
  const activity = await activityRepository.getActivityById(activityId);

  if (!activity) throw notFoundError();

  const activityEnrollments = await activityRepository.getUserActivities(userId);

  for (const enrollment of activityEnrollments) {
    const activityStartsAt = dayjs(enrollment.Activity.startsAt);
    const activityEndsAt = dayjs(enrollment.Activity.endsAt);
    const newActivityStartsAt = dayjs(activity.startsAt);
    const newActivityEndsAt = dayjs(activity.endsAt);

    if (newActivityStartsAt.isBefore(activityEndsAt) && newActivityEndsAt.isAfter(activityStartsAt)) {
      throw conflictError('Activity time conflict');
    }
  }
}
