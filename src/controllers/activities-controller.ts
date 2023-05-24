import httpStatus from 'http-status';
import { Response } from 'express';
import { AuthenticatedRequest } from '@/middlewares';
import activityService from '@/services/activity-service';

export async function getActivitiesByDay(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { date } = req.body;

  try {
    const activities = await activityService.getActivitiesByDay(userId, date);
    return res.status(httpStatus.OK).send(activities);
  } catch (error) {
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}
