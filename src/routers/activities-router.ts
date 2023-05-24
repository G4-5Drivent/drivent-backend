import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { getActivitiesByDay } from '@/controllers';

const activitiesRouter = Router();
activitiesRouter.use('/*', authenticateToken).get('/date', getActivitiesByDay);

export { activitiesRouter };
