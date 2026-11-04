import { IComment } from '@/domain/entities/interfaces.js';
import { ICommentsRepository, ICreateCommentDTO } from '@/domain/repositories/ICommentsRepository.js';
import { prisma } from '../prisma.js';
import { toApiComment } from '../mappers/commentMapper.js';

// The Prisma model calls the author `author`/`authorId`; the API exposes `user`/`userId`
// (see commentMapper.ts).
export class PrismaCommentsRepository implements ICommentsRepository {
  async create({ content, taskId, userId }: ICreateCommentDTO): Promise<IComment> {
    const comment = await prisma.comment.create({
      data: { content, taskId, authorId: userId },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return toApiComment(comment);
  }

  async findById(id: number): Promise<IComment | null> {
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        task: { select: { id: true, name: true } }
      }
    });

    return comment ? toApiComment(comment) : null;
  }

  async listByTask(taskId: number): Promise<IComment[]> {
    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: {
        author: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return comments.map((comment) => toApiComment(comment));
  }

  async delete(id: number): Promise<void> {
    await prisma.comment.delete({ where: { id } });
  }
}
