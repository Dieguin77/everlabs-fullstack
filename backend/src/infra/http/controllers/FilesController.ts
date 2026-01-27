import type { Request, Response } from 'express';
import { container } from 'tsyringe';
import { prisma } from '@/infra/database/prisma.js';
import { IFilesRepository } from '@/domain/repositories/IFilesRepository.js';
import { ITasksRepository } from '@/domain/repositories/ITasksRepository.js';
import path from 'path';
import fs from 'fs';

export class FilesController {
  async upload(request: Request, response: Response): Promise<Response> {
    const { taskId } = request.params;
    const { id: userId, role } = request.user;

    if (!request.file) {
      return response.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    const tasksRepository = container.resolve<ITasksRepository>('TasksRepository');
    const task = await tasksRepository.findById(Number(taskId));

    if (!task) {
      // Remove uploaded file if task not found
      fs.unlinkSync(request.file.path);
      return response.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    // Check permission: admin can upload to any task, user only to their assigned tasks
    if (role !== 'ADMIN' && task.assigneeId !== userId) {
      fs.unlinkSync(request.file.path);
      return response.status(403).json({
        status: 'error',
        message: 'You can only upload files to your assigned tasks'
      });
    }

    const filesRepository = container.resolve<IFilesRepository>('FilesRepository');
    
    const file = await filesRepository.create({
      fileName: request.file.originalname,
      filePath: request.file.path,
      taskId: Number(taskId),
      uploaderId: userId
    });

    return response.status(201).json({
      status: 'success',
      data: file
    });
  }

  async listByTask(request: Request, response: Response): Promise<Response> {
    const { taskId } = request.params;
    const { id: userId, role } = request.user;

    const tasksRepository = container.resolve<ITasksRepository>('TasksRepository');
    const task = await tasksRepository.findById(Number(taskId));

    if (!task) {
      return response.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    // Check permission
    if (role !== 'ADMIN' && task.assigneeId !== userId) {
      return response.status(403).json({
        status: 'error',
        message: 'You can only view files from your assigned tasks'
      });
    }

    const filesRepository = container.resolve<IFilesRepository>('FilesRepository');
    const files = await filesRepository.listByTask(Number(taskId));

    return response.json({
      status: 'success',
      data: files
    });
  }

  async delete(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const { id: userId, role } = request.user;

    const filesRepository = container.resolve<IFilesRepository>('FilesRepository');
    const file = await filesRepository.findById(Number(id));

    if (!file) {
      return response.status(404).json({
        status: 'error',
        message: 'File not found'
      });
    }

    // Only admin or file uploader can delete
    if (role !== 'ADMIN' && file.userId !== userId) {
      return response.status(403).json({
        status: 'error',
        message: 'You can only delete your own files'
      });
    }

    // Delete physical file
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (err) {
      console.error('Error deleting file:', err);
    }

    await filesRepository.delete(Number(id));

    return response.json({
      status: 'success',
      message: 'File deleted successfully'
    });
  }

  async download(request: Request, response: Response): Promise<Response | void> {
    const { id } = request.params;
    const { id: userId, role } = request.user;

    const filesRepository = container.resolve<IFilesRepository>('FilesRepository');
    const file = await filesRepository.findById(Number(id));

    if (!file) {
      return response.status(404).json({
        status: 'error',
        message: 'File not found'
      });
    }

    const tasksRepository = container.resolve<ITasksRepository>('TasksRepository');
    const task = await tasksRepository.findById(file.taskId);

    // Check permission
    if (role !== 'ADMIN' && task?.assigneeId !== userId) {
      return response.status(403).json({
        status: 'error',
        message: 'You can only download files from your assigned tasks'
      });
    }

    if (!fs.existsSync(file.path)) {
      return response.status(404).json({
        status: 'error',
        message: 'Physical file not found'
      });
    }

    response.download(file.path, file.name);
  }
}
