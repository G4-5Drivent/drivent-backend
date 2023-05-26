import 'dayjs/locale/pt';
import dayjs from 'dayjs';
import ticketService from '../tickets-service';
import { badRequestError } from '@/errors/bad-request-error';
import * as activityRepository from '@/repositories/activities-repository';
import { notFoundError } from '@/errors';
import { forBiddenError } from '@/errors/forbidden-error';
import { ActivityFullCapacityError } from '@/errors/activity-full-capacity-error';

async function getActivitiesByDay(userId: number, date: string) {
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

  await checkUserAlreadySubscribed(activityId, userId);
  await checkUserAccessToActivities(userId);
  await checkActivityAvailability(activityId);

  return await activityRepository.subscribeToActivity(userId, activityId);
}

async function unsubscribeToActivity(userId: number, activityId: number) {
  if (!userId || !activityId) throw badRequestError();

  await checkUserAccessToActivities(userId);
  await checkUserActivityOwnship(activityId, userId);

  return await activityRepository.unsubscribeToActivity(userId, activityId);
}

const activityService = {
  getActivitiesByDay,
  getActivityDays,
  subscribeToActivity,
  unsubscribeToActivity,
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
  if (activityEnrollment) throw forBiddenError();
}

async function checkActivitiesTimeConflict(activityId: number, userId: number) {
  const activity = await activityRepository.getActivityById(activityId);

  if (!activity) throw notFoundError();

  const activityEnrollments = await activityRepository.getActivityEnrollmentsById(activityId);

  const userEnrollments = activityEnrollments.filter((enrollment) => enrollment.userId === userId);

  const userEnrollmentsIds = userEnrollments.map((enrollment) => enrollment.id);

  const userEnrollmentsActivities = await activityRepository.getActivitiesByIds(userEnrollmentsIds);

  const activitiesTimeConflict = userEnrollmentsActivities.filter(
    (enrollmentActivity) => enrollmentActivity.startsAt === activity.startsAt,
  );

  if (activitiesTimeConflict.length > 0) throw forBiddenError();
}
