import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './errorHandler';

export function validateRequest(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const details = error.details.reduce(
        (acc: any, curr) => {
          acc[curr.path.join('.')] = curr.message;
          return acc;
        },
        {} as Record<string, string>,
      );

      throw new AppError(400, 'VALIDATION_ERROR', 'Validation failed', details);
    }

    req.body = value;
    next();
  };
}

export function validateQuery(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false });

    if (error) {
      const details = error.details.reduce(
        (acc: any, curr) => {
          acc[curr.path.join('.')] = curr.message;
          return acc;
        },
        {} as Record<string, string>,
      );

      throw new AppError(400, 'VALIDATION_ERROR', 'Validation failed', details);
    }

    req.query = value;
    next();
  };
}
