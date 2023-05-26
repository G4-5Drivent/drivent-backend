import { ApplicationError } from '@/protocols';

export function ActivityFullCapacityError(): ApplicationError {
  return {
    name: 'ActivityFullCapacityError',
    message: 'Acticity already has full capacity!',
  };
}
