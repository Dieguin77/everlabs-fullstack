import type { NextFunction, Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { errorHandler } from '../error.js';
import { AppError } from '../../shared/errors/AppError.js';

function run(error: Error) {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  errorHandler(error, {} as Request, { status } as unknown as Response, vi.fn() as unknown as NextFunction);
  return { status, json };
}

function prismaError(name: string, code?: string) {
  return Object.assign(new Error('boom'), { name, code });
}

describe('errorHandler', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps the status code of an AppError', () => {
    const { status } = run(new AppError('Not allowed', 403) as unknown as Error);
    expect(status).toHaveBeenCalledWith(403);
  });

  it('answers 500 for unknown errors', () => {
    const { status } = run(new Error('unexpected'));
    expect(status).toHaveBeenCalledWith(500);
  });

  it('answers 503 when Prisma cannot reach the database (initialization error)', () => {
    const { status, json } = run(prismaError('PrismaClientInitializationError'));

    expect(status).toHaveBeenCalledWith(503);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error', message: expect.stringContaining('indisponível') }),
    );
  });

  it.each(['P1001', 'P1002', 'P1008', 'P1017', 'P2024'])(
    'answers 503 for Prisma connectivity code %s',
    (code) => {
      const { status } = run(prismaError('PrismaClientKnownRequestError', code));
      expect(status).toHaveBeenCalledWith(503);
    },
  );

  it('keeps answering 500 for other Prisma errors', () => {
    const { status } = run(prismaError('PrismaClientKnownRequestError', 'P2002'));
    expect(status).toHaveBeenCalledWith(500);
  });
});
