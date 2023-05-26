import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { getActivitiesByDate, getDayActivities, subscribeToActivity, unsubscribeToActivity } from '@/controllers';
import { activitySchema, dateBodySchema } from '@/schemas/activities-schema';

const activitiesRouter = Router();
activitiesRouter
  .use('/*', authenticateToken)
  .post('', validateBody(activitySchema), subscribeToActivity)
  .get('/date', validateBody(dateBodySchema), getActivitiesByDate)
  .get('/days', getDayActivities)
  .get('/places/date', validateBody(dateBodySchema), getActivitiesByDate)
  .delete('', validateBody(activitySchema), unsubscribeToActivity);

export { activitiesRouter };
