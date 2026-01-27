import type { Request, Response } from 'express';
import { container } from 'tsyringe';
import { ITagsRepository } from '@/domain/repositories/ITagsRepository.js';
import { ITasksRepository } from '@/domain/repositories/ITasksRepository.js';

export class TagsController {
  async create(request: Request, response: Response): Promise<Response> {
    const { name } = request.body;

    const tagsRepository = container.resolve<ITagsRepository>('TagsRepository');
    
    // Check if tag already exists
    const existingTag = await tagsRepository.findByName(name);
    if (existingTag) {
      return response.status(400).json({
        status: 'error',
        message: 'Tag with this name already exists'
      });
    }

    const tag = await tagsRepository.create({ name });

    return response.status(201).json({
      status: 'success',
      data: tag
    });
  }

  async list(request: Request, response: Response): Promise<Response> {
    const tagsRepository = container.resolve<ITagsRepository>('TagsRepository');
    const tags = await tagsRepository.list();

    return response.json({
      status: 'success',
      data: tags
    });
  }

  async delete(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;

    const tagsRepository = container.resolve<ITagsRepository>('TagsRepository');
    const tag = await tagsRepository.findById(Number(id));

    if (!tag) {
      return response.status(404).json({
        status: 'error',
        message: 'Tag not found'
      });
    }

    await tagsRepository.delete(Number(id));

    return response.json({
      status: 'success',
      message: 'Tag deleted successfully'
    });
  }

  async addToTask(request: Request, response: Response): Promise<Response> {
    const { taskId, tagId } = request.params;
    const { id: userId, role } = request.user;

    const tagsRepository = container.resolve<ITagsRepository>('TagsRepository');
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
        message: 'You can only add tags to your assigned tasks'
      });
    }

    const tag = await tagsRepository.findById(Number(tagId));
    if (!tag) {
      return response.status(404).json({
        status: 'error',
        message: 'Tag not found'
      });
    }

    try {
      await tagsRepository.addToTask(Number(taskId), Number(tagId));
    } catch (error) {
      return response.status(400).json({
        status: 'error',
        message: 'Tag already added to this task'
      });
    }

    return response.status(201).json({
      status: 'success',
      message: 'Tag added to task'
    });
  }

  async removeFromTask(request: Request, response: Response): Promise<Response> {
    const { taskId, tagId } = request.params;
    const { id: userId, role } = request.user;

    const tagsRepository = container.resolve<ITagsRepository>('TagsRepository');
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
        message: 'You can only remove tags from your assigned tasks'
      });
    }

    try {
      await tagsRepository.removeFromTask(Number(taskId), Number(tagId));
    } catch (error) {
      return response.status(404).json({
        status: 'error',
        message: 'Tag not found on this task'
      });
    }

    return response.json({
      status: 'success',
      message: 'Tag removed from task'
    });
  }

  async listByTask(request: Request, response: Response): Promise<Response> {
    const { taskId } = request.params;
    const { id: userId, role } = request.user;

    const tagsRepository = container.resolve<ITagsRepository>('TagsRepository');
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
        message: 'You can only view tags from your assigned tasks'
      });
    }

    const tags = await tagsRepository.listByTask(Number(taskId));

    return response.json({
      status: 'success',
      data: tags
    });
  }
}
