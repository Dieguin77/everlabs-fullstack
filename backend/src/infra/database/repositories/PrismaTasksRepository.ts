import { ITask } from '@/domain/entities/interfaces.js';
import { TaskStatus } from '@/domain/entities/types.js';
import { ICreateTaskDTO, ITasksRepository, IUpdateTaskDTO } from '@/domain/repositories/ITasksRepository.js';
import { prisma } from '../prisma.js';

export class PrismaTasksRepository implements ITasksRepository {
  async create(data: ICreateTaskDTO): Promise<ITask> {
    return prisma.task.create({
      data: {
        ...data,
        status: 'TODO'
      }
    });
  }

  async findById(id: number): Promise<ITask | null> {
    return prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        files: true
      }
    });
  }

  async findByAssignee(assigneeId: number): Promise<ITask[]> {
    return prisma.task.findMany({
      where: {
        assigneeId
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            comments: true,
            files: true,
            tags: true
          }
        }
      }
    });
  }

  async list(): Promise<ITask[]> {
    return prisma.task.findMany({
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            comments: true,
            files: true,
            tags: true
          }
        }
      }
    });
  }

  async update(id: number, data: IUpdateTaskDTO): Promise<ITask> {
    return prisma.task.update({
      where: { id },
      data,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  async updateStatus(id: number, status: TaskStatus): Promise<ITask> {
    return prisma.task.update({
      where: { id },
      data: { status },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.task.delete({
      where: { id }
    });
  }
}