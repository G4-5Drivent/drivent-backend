import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { bookingRoom, changeBooking, listBooking, listRoomsInfo } from '@/controllers';

const bookingRouter = Router();

bookingRouter
  .all('/*', authenticateToken)
  .get('', listBooking)
  .post('', bookingRoom)
  .put('/:bookingId', changeBooking)
  .get('/info/rooms', listRoomsInfo);

export { bookingRouter };
