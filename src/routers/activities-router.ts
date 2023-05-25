import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { getActivitiesByDay, getDayActivities, subscribeToActivity } from '@/controllers';

const activitiesRouter = Router();
activitiesRouter
  .use('/*', authenticateToken)
  .post('', subscribeToActivity)
  .get('/date', getActivitiesByDay)
  .get('/days', getDayActivities);

export { activitiesRouter };
