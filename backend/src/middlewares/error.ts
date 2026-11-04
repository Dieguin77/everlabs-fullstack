import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../shared/errors/AppError.js';

// Prisma error codes meaning "the database cannot be reached / answered too slowly".
const DATABASE_UNAVAILABLE_CODES = ['P1001', 'P1002', 'P1008', 'P1017', 'P2024'];

// Duck-typed on purpose: keeps this middleware free of Prisma imports and easy to unit test.
function isDatabaseUnavailable(error: Error & { code?: string }): boolean {
  if (error.name === 'PrismaClientInitializationError') return true;

  return (
    error.name === 'PrismaClientKnownRequestError' &&
    typeof error.code === 'string' &&
    DATABASE_UNAVAILABLE_CODES.includes(error.code)
  );
}

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

  if (isDatabaseUnavailable(error)) {
    return response.status(503).json({
      status: 'error',
      message: 'Banco de dados temporariamente indisponível. Tente novamente em instantes.',
    });
  }

  return response.status(500).json({
    status: 'error',
    message: 'Internal server error.',
  });
}
