import Joi from 'joi';

export const activitySchema = Joi.object({
  activityId: Joi.number().min(1).required(),
});

export const dateBodySchema = Joi.object({
  date: Joi.string().required(),
});
