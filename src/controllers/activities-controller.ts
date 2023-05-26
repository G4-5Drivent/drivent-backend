import httpStatus from 'http-status';
import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '@/middlewares';
import activityService from '@/services/activity-service';

export async function getActivitiesByDate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;
  const { date } = req.body;

  console.log(date);

  try {
    const activities = await activityService.getActivitiesByDate(userId, date);
    return res.status(httpStatus.OK).send(activities);
  } catch (error) {
    next(error);
  }
}

export async function getDayActivities(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;

  try {
    const activities = await activityService.getActivityDays(userId);
    return res.status(httpStatus.OK).send(activities);
  } catch (error) {
    next(error);
  }
}

export async function subscribeToActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;
  const { activityId } = req.body;

  try {
    await activityService.subscribeToActivity(userId, activityId);
    return res.sendStatus(httpStatus.CREATED);
  } catch (error) {
    next(error);
  }
}

export async function unsubscribeToActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;
  const { activityId } = req.body;

  try {
    await activityService.unsubscribeToActivity(userId, activityId);
    return res.sendStatus(httpStatus.OK);
  } catch (error) {
    next(error);
  }
}
