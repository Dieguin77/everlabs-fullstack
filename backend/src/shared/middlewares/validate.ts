import type { Request, Response, NextFunction } from 'express';
import { ZodObject } from 'zod';
import { AnyZodObject } from 'zod/v3';

export const validate = (schema: AnyZodObject, property: 'body' | 'params' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[property]);

    if (!result.success) {
      return res.status(400).json({ status: 'error', errors: result.error.format() });
    }

    // replace with parsed/coerced values
    // @ts-ignore
    req[property] = result.data;
    return next();
  };
};
