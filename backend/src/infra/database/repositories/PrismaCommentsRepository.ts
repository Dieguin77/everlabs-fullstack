import { IComment } from '@/domain/entities/interfaces.js';
import { ICommentsRepository, ICreateCommentDTO } from '@/domain/repositories/ICommentsRepository.js';
import { prisma } from '../prisma.js';

export class PrismaCommentsRepository implements ICommentsRepository {
  async create(data: ICreateCommentDTO): Promise<IComment> {
    return prisma.comment.create({
      data,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  async findById(id: number): Promise<IComment | null> {
    return prisma.comment.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        task: { select: { id: true, name: true } }
      }
    });
  }

  async listByTask(taskId: number): Promise<IComment[]> {
    return prisma.comment.findMany({
      where: { taskId },
      include: {
        user: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.comment.delete({ where: { id } });
  }
}