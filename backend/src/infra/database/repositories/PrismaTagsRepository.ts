import { ITag } from '@/domain/entities/interfaces.js';
import { ITagsRepository, ICreateTagDTO } from '@/domain/repositories/ITagsRepository.js';
import { prisma } from '../prisma.js';

export class PrismaTagsRepository implements ITagsRepository {
  async create(data: ICreateTagDTO): Promise<ITag> {
    const tag = await prisma.tag.create({
      data: {
        name: data.name
      }
    });

    return {
      id: tag.id,
      name: tag.name,
      color: undefined,
      createdAt: new Date()
    };
  }

  async findById(id: number): Promise<ITag | null> {
    const tag = await prisma.tag.findUnique({
      where: { id }
    });

    if (!tag) return null;

    return {
      id: tag.id,
      name: tag.name,
      color: undefined,
      createdAt: new Date()
    };
  }

  async findByName(name: string): Promise<ITag | null> {
    const tag = await prisma.tag.findUnique({
      where: { name }
    });

    if (!tag) return null;

    return {
      id: tag.id,
      name: tag.name,
      color: undefined,
      createdAt: new Date()
    };
  }

  async list(): Promise<ITag[]> {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' }
    });

    return tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      color: undefined,
      createdAt: new Date()
    }));
  }

  async delete(id: number): Promise<void> {
    await prisma.tag.delete({ where: { id } });
  }

  async addToTask(taskId: number, tagId: number): Promise<void> {
    await prisma.taskTag.create({
      data: {
        taskId,
        tagId
      }
    });
  }

  async removeFromTask(taskId: number, tagId: number): Promise<void> {
    await prisma.taskTag.delete({
      where: {
        taskId_tagId: {
          taskId,
          tagId
        }
      }
    });
  }

  async listByTask(taskId: number): Promise<ITag[]> {
    const taskTags = await prisma.taskTag.findMany({
      where: { taskId },
      include: {
        tag: true
      }
    });

    return taskTags.map(tt => ({
      id: tt.tag.id,
      name: tt.tag.name,
      color: undefined,
      createdAt: new Date()
    }));
  }
}
