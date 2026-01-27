import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface ITokenPayload {
  userId: number;
  role: string;
  iat: number;
  exp: number;
  sub: string;
}

export function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new Error('JWT token is missing');
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default');
    const { userId, role } = decoded as ITokenPayload;

    request.user = {
      id: userId,
      role
    };

    return next();
  } catch {
    throw new Error('Invalid JWT token');
  }
}