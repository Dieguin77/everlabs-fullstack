import { IFile } from '@/domain/entities/interfaces.js';
import { IFilesRepository, ICreateFileDTO } from '@/domain/repositories/IFilesRepository.js';
import { prisma } from '../prisma.js';

export class PrismaFilesRepository implements IFilesRepository {
  async create(data: ICreateFileDTO): Promise<IFile> {
    const file = await prisma.file.create({
      data: {
        fileName: data.fileName,
        filePath: data.filePath,
        taskId: data.taskId,
        uploaderId: data.uploaderId
      },
      include: {
        uploader: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return {
      id: file.id,
      name: file.fileName,
      path: file.filePath,
      mimeType: '',
      size: 0,
      taskId: file.taskId,
      userId: file.uploaderId,
      createdAt: file.uploadedAt
    };
  }

  async findById(id: number): Promise<IFile | null> {
    const file = await prisma.file.findUnique({
      where: { id },
      include: {
        uploader: { select: { id: true, name: true, email: true } },
        task: { select: { id: true, name: true } }
      }
    });

    if (!file) return null;

    return {
      id: file.id,
      name: file.fileName,
      path: file.filePath,
      mimeType: '',
      size: 0,
      taskId: file.taskId,
      userId: file.uploaderId,
      createdAt: file.uploadedAt
    };
  }

  async listByTask(taskId: number): Promise<IFile[]> {
    const files = await prisma.file.findMany({
      where: { taskId },
      include: {
        uploader: { select: { id: true, name: true } }
      },
      orderBy: { uploadedAt: 'desc' }
    });

    return files.map(file => ({
      id: file.id,
      name: file.fileName,
      path: file.filePath,
      mimeType: '',
      size: 0,
      taskId: file.taskId,
      userId: file.uploaderId,
      createdAt: file.uploadedAt
    }));
  }

  async delete(id: number): Promise<void> {
    await prisma.file.delete({ where: { id } });
  }
}
