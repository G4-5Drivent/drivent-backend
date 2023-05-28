import { ApplicationError } from '@/protocols';

export default function UnprocessableEntityError(message?: string): ApplicationError {
  return {
    name: 'UnprocessableEntityError',
    message: message || 'Unprocessable Entity',
  };
}
