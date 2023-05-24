import dayjs from 'dayjs';
import { badRequestError } from '@/errors/bad-request-error';
import * as activityRepository from '@/repositories/activities-repository';

export async function getActivitiesByDay(targetDate: string) {
  // VERIFICAR SE USUARIO TEM TICKET PAGO
  // VERIFICAR SE USUARIO TEM TICKET PRESENCIAL
  const date = dayjs(targetDate);

  if (!date.isValid()) throw badRequestError();

  return activityRepository.getActivitiesByDay(date);
}
