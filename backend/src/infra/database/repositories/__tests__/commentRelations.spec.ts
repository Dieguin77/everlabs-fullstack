import { describe, expect, it, vi } from 'vitest';
import { assertValidPrismaArgs } from '@/test/assertValidPrismaArgs';
import { toApiComment } from '../../mappers/commentMapper.js';
import { PrismaCommentsRepository } from '../PrismaCommentsRepository.js';
import { PrismaTasksRepository } from '../PrismaTasksRepository.js';

// A fake Prisma client that validates every query against the real schema, like Prisma does.
vi.mock('../../prisma.js', async () => {
  const { assertValidPrismaArgs: validate } = await import('@/test/assertValidPrismaArgs');
  const author = { id: 7, name: 'Demo' };
  const comment = { id: 1, content: 'Hello', taskId: 3, authorId: 7, createdAt: new Date('2026-01-01') };

  return {
    prisma: {
      comment: {
        create: async (args: Record<string, any>) => (validate('Comment', args), { ...comment, content: args.data.content, author }),
        findUnique: async (args: Record<string, any>) => (validate('Comment', args), { ...comment, author, task: { id: 3, name: 'T' } }),
        findMany: async (args: Record<string, any>) => (validate('Comment', args), [{ ...comment, author }]),
      },
      task: {
        findUnique: async (args: Record<string, any>) => (
          validate('Task', args),
          { id: 3, name: 'T', assigneeId: 7, assignee: null, tags: [], files: [], comments: [{ ...comment, author }] }
        ),
      },
    },
  };
});

describe('assertValidPrismaArgs (guards the test itself)', () => {
  it('rejects the exact mistake that broke production: include.user on Comment', () => {
    expect(() => assertValidPrismaArgs('Comment', { include: { user: true } })).toThrow(/Unknown field `user`/);
  });

  it('rejects userId in comment data, since the column is authorId', () => {
    expect(() => assertValidPrismaArgs('Comment', { data: { content: 'x', taskId: 1, userId: 7 } })).toThrow(/Unknown argument `userId`/);
  });

  it('accepts the real relation names', () => {
    expect(() => assertValidPrismaArgs('Comment', { data: { content: 'x', taskId: 1, authorId: 7 }, include: { author: { select: { id: true } } } })).not.toThrow();
  });
});

describe('toApiComment', () => {
  it('exposes the author as user/userId and keeps the other fields', () => {
    const result = toApiComment({ id: 1, content: 'Hi', authorId: 7, author: { id: 7, name: 'Demo' } });

    expect(result).toMatchObject({ id: 1, content: 'Hi', userId: 7, user: { id: 7, name: 'Demo' } });
    expect(result).not.toHaveProperty('author');
  });

  it('does not fail when the author was not loaded', () => {
    expect(toApiComment({ id: 1, authorId: 7 })).toMatchObject({ id: 1, userId: 7, user: undefined });
  });
});

describe('PrismaCommentsRepository', () => {
  const repository = new PrismaCommentsRepository();

  it('creates a comment with authorId and returns userId/user', async () => {
    const created = await repository.create({ content: 'Nice work', taskId: 3, userId: 7 });

    expect(created).toMatchObject({ content: 'Nice work', userId: 7, user: { id: 7, name: 'Demo' } });
  });

  it('finds a comment by id and exposes userId (used by the delete permission check)', async () => {
    const found = await repository.findById(1);

    expect(found).toMatchObject({ id: 1, userId: 7, user: { id: 7 } });
  });

  it('lists the comments of a task with their author', async () => {
    const comments = await repository.listByTask(3);

    expect(comments).toHaveLength(1);
    expect(comments[0]).toMatchObject({ userId: 7, user: { id: 7, name: 'Demo' } });
  });
});

describe('PrismaTasksRepository.findById', () => {
  it('loads the task with its comments and exposes each author as user/userId', async () => {
    const task = await new PrismaTasksRepository().findById(3);

    expect(task).toMatchObject({ id: 3, comments: [{ userId: 7, user: { id: 7, name: 'Demo' } }] });
  });
});
