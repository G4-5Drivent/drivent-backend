import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import {
  getActivitiesByDate,
  getDatePlacesAndActivities,
  getDayActivities,
  subscribeToActivity,
  unsubscribeToActivity,
} from '@/controllers';
import { activitySchema, dateBodySchema } from '@/schemas/activities-schema';

const activitiesRouter = Router();
activitiesRouter
  .use('/*', authenticateToken)
  .post('', validateBody(activitySchema), subscribeToActivity)
  .get('/date/:date', getActivitiesByDate)
  .get('/days', getDayActivities)
  .get('/places/date/:date', getDatePlacesAndActivities)
  .delete('', validateBody(activitySchema), unsubscribeToActivity);

export { activitiesRouter };
