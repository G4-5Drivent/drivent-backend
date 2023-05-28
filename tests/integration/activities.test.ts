import faker from '@faker-js/faker';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import dayjs from 'dayjs';
import { TicketStatus } from '@prisma/client';
import {
  createUser,
  createActivity,
  createEnrollmentWithAddress,
  createTicket,
  createTicketTypeWithHotel,
  createTicketTypeRemote,
  createActivityEnrollment,
  createPlace,
  createActivityWithPlaceId,
  createPlaceWithoutCapacity,
  createActivityAtSameTime,
  createSubscription,
} from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import app, { init } from '@/app';
import { prisma } from '@/config';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /activities/date', () => {
  it('should respond with status 401 if no token is given', async () => {
    const date = dayjs().format('YYYY-MM-DD');
    const response = await server.get(`/activities/date/${date}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();
    const date = dayjs().format('YYYY-MM-DD');

    const response = await server.get(`/activities/date/${date}`).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const date = dayjs().format('YYYY-MM-DD');

    const response = await server.get(`/activities/date/${date}`).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with empty array when there are no activity created', async () => {
      const token = await generateValidToken();
      const date = dayjs().format('YYYY-MM-DD');

      const response = await server
        .get(`/activities/date/${date}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ date: Date.now() });

      expect(response.body).toEqual({ message: 'No result for this search!' });
    });

    it('should respond with status 404 when the user have not a ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const activity = await createActivity();
      const date = dayjs(activity.startsAt).format('YYYY-MM-DD');

      const response = await server
        .get(`/activities/date/${date}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ date: dayjs(activity.startsAt).format('YYYY-MM-DD') });

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
  });

  it('should respond with status 403 when a activity exists and the user have not a paid ticket', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
    const activity = await createActivity();
    const date = dayjs(activity.startsAt).format('YYYY-MM-DD');

    const response = await server
      .get(`/activities/date/${date}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ date: dayjs(activity.startsAt).format('YYYY-MM-DD') });

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });
});

it('should respond with status 403 when a activity exists and the user have not a presential ticket', async () => {
  const user = await createUser();
  const token = await generateValidToken(user);
  const enrollment = await createEnrollmentWithAddress(user);
  const ticketType = await createTicketTypeRemote();
  const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
  const activity = await createActivity();
  const date = dayjs(activity.startsAt).format('YYYY-MM-DD');

  const response = await server.get(`/activities/date/${date}`).set('Authorization', `Bearer ${token}`);

  expect(response.status).toBe(httpStatus.FORBIDDEN);
});

it('should respond with status 200 and with existing activity data when the user can access the activities', async () => {
  const user = await createUser();
  const token = await generateValidToken(user);
  const enrollment = await createEnrollmentWithAddress(user);
  const ticketType = await createTicketTypeWithHotel();
  const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
  const activity = await createActivity();
  const date = dayjs(activity.startsAt).format('YYYY-MM-DD');

  const response = await server
    .get(`/activities/date/${date}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ date: dayjs(activity.startsAt).format('YYYY-MM-DD') });

  expect(response.status).toBe(httpStatus.OK);
  expect(response.body).toMatchObject([
    {
      id: activity.id,
      name: activity.name,
      placeId: activity.placeId,
      createdAt: activity.createdAt.toISOString(),
      updatedAt: activity.updatedAt.toISOString(),
    },
  ]);
});

describe('GET /activities/days', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/activities/days');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/activities/days').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/activities/days').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with empty array when there are no activity created', async () => {
      const token = await generateValidToken();

      const response = await server.get('/activities/days').set('Authorization', `Bearer ${token}`);

      expect(response.body).toEqual({ message: 'No result for this search!' });
    });

    it('should respond with status 404 when the user have not a ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const activity = await createActivity();

      const response = await server.get('/activities/days').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
  });

  it('should respond with status 403 when a activity exists and the user have not a paid ticket', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
    const activity = await createActivity();

    const response = await server.get('/activities/days').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });
});

it('should respond with status 403 when a activity exists and the user have not a presential ticket', async () => {
  const user = await createUser();
  const token = await generateValidToken(user);
  const enrollment = await createEnrollmentWithAddress(user);
  const ticketType = await createTicketTypeRemote();
  const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
  const activity = await createActivity();

  const response = await server.get('/activities/days').set('Authorization', `Bearer ${token}`);

  expect(response.status).toBe(httpStatus.FORBIDDEN);
});

it('should respond with status 200 with activitys days data when the user can access the activities', async () => {
  const user = await createUser();
  const token = await generateValidToken(user);
  const enrollment = await createEnrollmentWithAddress(user);
  const ticketType = await createTicketTypeWithHotel();
  const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
  const activity = await createActivity();

  const response = await server.get('/activities/days').set('Authorization', `Bearer ${token}`);

  expect(response.status).toBe(httpStatus.OK);
  expect(response.body).toEqual([
    {
      date: dayjs(activity.startsAt).format('YYYY-MM-DD'),
      day: dayjs(activity.startsAt).locale('pt').format('dddd'),
    },
  ]);
});

describe('GET /activities/places/date', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/activities/places/date');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/activities/places/date').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/activities/places/date').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with empty array when there are no activity created', async () => {
      const token = await generateValidToken();

      const response = await server
        .get('/activities/places/date')
        .set('Authorization', `Bearer ${token}`)
        .send({ date: Date.now() });

      expect(response.body).toEqual({ message: 'No result for this search!' });
    });

    it('should respond with status 404 when the user have not a ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const activity = await createActivity();

      const response = await server
        .get('/activities/places/date')
        .set('Authorization', `Bearer ${token}`)
        .send({ date: dayjs(activity.startsAt).format('YYYY-MM-DD') });

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
  });

  it('should respond with status 403 when a activity exists and the user have not a paid ticket', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
    const activity = await createActivity();

    const response = await server
      .get('/activities/places/date')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: dayjs(activity.startsAt).format('YYYY-MM-DD') });

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });
});

it('should respond with status 403 when a activity exists and the user have not a presential ticket', async () => {
  const user = await createUser();
  const token = await generateValidToken(user);
  const enrollment = await createEnrollmentWithAddress(user);
  const ticketType = await createTicketTypeRemote();
  const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
  const activity = await createActivity();

  const response = await server
    .get('/activities/places/date')
    .set('Authorization', `Bearer ${token}`)
    .send({ date: dayjs(activity.startsAt).format('YYYY-MM-DD') });

  expect(response.status).toBe(httpStatus.FORBIDDEN);
});

it('should respond with status 200 and with existing activity data when the user can access the activities', async () => {
  await cleanDb();

  const user = await createUser();
  const token = await generateValidToken(user);
  const enrollment = await createEnrollmentWithAddress(user);
  const ticketType = await createTicketTypeWithHotel();
  const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
  const place = await createPlace();
  const activity = await createActivityWithPlaceId(place.id);
  const ActivityEnrollment = await createActivityEnrollment(user.id, activity.id);
  const occupedPlace = await prisma.activityEnrollment.findMany({ where: { activityId: activity.id } });

  const response = await server
    .get('/activities/places/date')
    .set('Authorization', `Bearer ${token}`)
    .send({ date: dayjs(activity.startsAt).format('YYYY-MM-DD') });

  expect(response.status).toBe(httpStatus.OK);
  expect(response.body).toMatchObject([
    {
      activities: [
        {
          id: activity.id,
          name: activity.name,
          placeId: activity.placeId,
          startsAt: dayjs(activity.startsAt).format('HH:mm'),
          endsAt: dayjs(activity.endsAt).format('HH:mm'),
          spotsAvailable: place.capacity - occupedPlace.length,
        },
      ],
    },
  ]);
});

describe('POST /activities', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/activities');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/activities').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post('/activities').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 400 when an activity id in not given', async () => {
      const token = await generateValidToken();

      const response = await server.post('/activities').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 404 when the user have not a ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const activity = await createActivity();

      const response = await server
        .post('/activities')
        .set('Authorization', `Bearer ${token}`)
        .send({ activityId: activity.id });

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
  });

  it('should respond with status 403 when a activity exists and the user have not a paid ticket', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
    const activity = await createActivity();

    const response = await server
      .post('/activities')
      .set('Authorization', `Bearer ${token}`)
      .send({ activityId: activity.id });

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });
});

it('should respond with status 403 when a activity exists and the user have not a presential ticket', async () => {
  const user = await createUser();
  const token = await generateValidToken(user);
  const enrollment = await createEnrollmentWithAddress(user);
  const ticketType = await createTicketTypeRemote();
  const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
  const activity = await createActivity();

  const response = await server
    .post('/activities')
    .set('Authorization', `Bearer ${token}`)
    .send({ activityId: activity.id });

  expect(response.status).toBe(httpStatus.FORBIDDEN);
});

it('should respond with status 409 when the user is allready subscribed', async () => {
  const user = await createUser();
  const token = await generateValidToken(user);
  const enrollment = await createEnrollmentWithAddress(user);
  const ticketType = await createTicketTypeWithHotel();
  const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
  const activity = await createActivity();
  createSubscription(user.id, activity.id);

  const response = await server
    .post('/activities')
    .set('Authorization', `Bearer ${token}`)
    .send({ activityId: activity.id });

  expect(response.status).toBe(httpStatus.CONFLICT);
});

it('should respond with status 404 when the informed id does not exists', async () => {
  const user = await createUser();
  const token = await generateValidToken(user);
  const enrollment = await createEnrollmentWithAddress(user);
  const ticketType = await createTicketTypeWithHotel();
  const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
  const activity = await createActivity();

  const response = await server
    .post('/activities')
    .set('Authorization', `Bearer ${token}`)
    .send({ activityId: activity.id + 54 });

  expect(response.status).toBe(httpStatus.NOT_FOUND);
});

it('should respond with status 403 when the capacity is 0', async () => {
  const user = await createUser();
  const token = await generateValidToken(user);
  const enrollment = await createEnrollmentWithAddress(user);
  const ticketType = await createTicketTypeWithHotel();
  const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
  const place = await createPlaceWithoutCapacity();
  const activity = await createActivityWithPlaceId(place.id);

  const response = await server
    .post('/activities')
    .set('Authorization', `Bearer ${token}`)
    .send({ activityId: activity.id });

  expect(response.status).toBe(httpStatus.FORBIDDEN);
});

it('should respond with status 409 when time conflict', async () => {
  const user = await createUser();
  const token = await generateValidToken(user);
  const enrollment = await createEnrollmentWithAddress(user);
  const ticketType = await createTicketTypeWithHotel();
  const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
  const place = await createPlace();
  const activity = await createActivityWithPlaceId(place.id);
  const subscription = await createSubscription(user.id, activity.id);
  const activitySameTime = await createActivityAtSameTime(activity.startsAt, activity.endsAt);

  const response = await server
    .post('/activities')
    .set('Authorization', `Bearer ${token}`)
    .send({ activityId: activitySameTime.id });

  expect(response.status).toBe(httpStatus.CONFLICT);
});

it('should respond with status 201 whit successful subscription', async () => {
  const user = await createUser();
  const token = await generateValidToken(user);
  const enrollment = await createEnrollmentWithAddress(user);
  const ticketType = await createTicketTypeWithHotel();
  const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
  const activity = await createActivity();

  const response = await server
    .post('/activities')
    .set('Authorization', `Bearer ${token}`)
    .send({ activityId: activity.id });

  expect(response.status).toBe(httpStatus.CREATED);
});

describe('POST /activities', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.delete('/activities');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.delete('/activities').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.delete('/activities').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 400 when an activity id in not given', async () => {
      const token = await generateValidToken();

      const response = await server.delete('/activities').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 404 when the user have not a ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const activity = await createActivity();

      const response = await server
        .delete('/activities')
        .set('Authorization', `Bearer ${token}`)
        .send({ activityId: activity.id });

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
  });

  it('should respond with status 403 when a activity exists and the user have not a paid ticket', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
    const activity = await createActivity();

    const response = await server
      .delete('/activities')
      .set('Authorization', `Bearer ${token}`)
      .send({ activityId: activity.id });

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });
});

it('should respond with status 403 when a activity exists and the user have not a presential ticket', async () => {
  const user = await createUser();
  const token = await generateValidToken(user);
  const enrollment = await createEnrollmentWithAddress(user);
  const ticketType = await createTicketTypeRemote();
  const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
  const activity = await createActivity();

  const response = await server
    .delete('/activities')
    .set('Authorization', `Bearer ${token}`)
    .send({ activityId: activity.id });

  expect(response.status).toBe(httpStatus.FORBIDDEN);
});

it('should respond with status 404 when the informed id does not exists', async () => {
  const user = await createUser();
  const token = await generateValidToken(user);
  const enrollment = await createEnrollmentWithAddress(user);
  const ticketType = await createTicketTypeWithHotel();
  const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
  const activity = await createActivity();

  const response = await server
    .delete('/activities')
    .set('Authorization', `Bearer ${token}`)
    .send({ activityId: activity.id + 54 });

  expect(response.status).toBe(httpStatus.NOT_FOUND);
});

it('should respond with status 200 whit successful unsubscription', async () => {
  const user = await createUser();
  const token = await generateValidToken(user);
  const enrollment = await createEnrollmentWithAddress(user);
  const ticketType = await createTicketTypeWithHotel();
  const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
  const activity = await createActivity();
  const subscription = await createSubscription(user.id, activity.id);

  const response = await server
    .delete('/activities')
    .set('Authorization', `Bearer ${token}`)
    .send({ activityId: activity.id });

  expect(response.status).toBe(httpStatus.OK);
});
