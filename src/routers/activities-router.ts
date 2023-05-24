import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { getActivitiesByDay, getDayActivities } from '@/controllers';

const activitiesRouter = Router();
activitiesRouter.use('/*', authenticateToken).get('/date', getActivitiesByDay).get('/days', getDayActivities);

export { activitiesRouter };
