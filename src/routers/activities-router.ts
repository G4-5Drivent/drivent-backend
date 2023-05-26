import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { getActivitiesByDay, getDayActivities, subscribeToActivity, unsubscribeToActivity } from '@/controllers';
import { activitySchema, dateBodySchema } from '@/schemas/activities-schema';

const activitiesRouter = Router();
activitiesRouter
  .use('/*', authenticateToken)
  .post('', subscribeToActivity)
  .get('/date', validateBody(dateBodySchema), getActivitiesByDay)
  .get('/days', validateBody(activitySchema), getDayActivities)
  .delete('', validateBody(activitySchema), unsubscribeToActivity);

export { activitiesRouter };
