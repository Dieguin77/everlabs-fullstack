import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../shared/errors/AppError.js';

export function errorHandler(
  error: Error,
  request: Request,
  response: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);

  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
  }

  if (error instanceof ZodError) {
    return response.status(400).json({
      status: 'error',
      message: 'Validation error.',
      issues: error.format(),
    });
  }

  return response.status(500).json({
    status: 'error',
    message: 'Internal server error.',
  });
}
