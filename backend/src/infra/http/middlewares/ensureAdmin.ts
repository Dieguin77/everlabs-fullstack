import type { Request, Response, NextFunction } from 'express';

export function ensureAdmin(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const { user } = request;

  if (!user) {
    throw new Error('User not authenticated');
  }

  if (user.role !== 'ADMIN') {
    throw new Error('User is not an administrator');
  }

  return next();
}