import type { Request, Response } from 'express';
import { container } from 'tsyringe';
import { CreateTaskUseCase } from '@/domain/useCases/CreateTaskUseCase.js';
import { UpdateTaskUseCase } from '@/domain/useCases/UpdateTaskUseCase.js';
import { prisma } from '@/infra/database/prisma.js';

export class TasksController {
  async create(request: Request, response: Response): Promise<Response> {
    const { name, description, startDate, endDate, priority, assigneeId } = request.body;

    const createTask = container.resolve(CreateTaskUseCase);

    const task = await createTask.execute({
      name,
      description,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      priority,
      assigneeId
    });

    return response.status(201).json({
      status: 'success',
      data: task
    });
  }

  async update(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const { name, description, startDate, endDate, priority, status, assigneeId } = request.body;
    const { id: userId, role } = request.user;

    const updateTask = container.resolve(UpdateTaskUseCase);

    const task = await updateTask.execute(Number(id), {
      name,
      description,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      priority,
      status,
      assigneeId
    }, userId, role);

    return response.json({
      status: 'success',
      data: task
    });
  }

  async list(request: Request, response: Response): Promise<Response> {
    const { role, id: userId } = request.user;

    const tasks = role === 'ADMIN' 
      ? await prisma.task.findMany({
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
          },
          orderBy: {
            createdAt: 'desc'
          }
        })
      : await prisma.task.findMany({
          where: {
            assigneeId: userId
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
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

    return response.json({
      status: 'success',
      data: tasks
    });
  }

  async findById(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const { role, id: userId } = request.user;

    const task = await prisma.task.findUnique({
      where: { id: Number(id) },
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
          },
          orderBy: {
            createdAt: 'desc'
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

    if (!task) {
      return response.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    // Verifica se o usuário tem permissão para ver a tarefa
    if (role !== 'ADMIN' && task.assigneeId !== userId) {
      return response.status(403).json({
        status: 'error',
        message: 'You can only view your own tasks'
      });
    }

    return response.json({
      status: 'success',
      data: task
    });
  }

  async delete(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const { role } = request.user;

    if (role !== 'ADMIN') {
      return response.status(403).json({
        status: 'error',
        message: 'Only administrators can delete tasks'
      });
    }

    const task = await prisma.task.findUnique({
      where: { id: Number(id) }
    });

    if (!task) {
      return response.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    await prisma.task.delete({
      where: { id: Number(id) }
    });

    return response.json({
      status: 'success',
      message: 'Task deleted successfully'
    });
  }

  async updateStatus(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const { status } = request.body;
    const { id: userId, role } = request.user;

    const task = await prisma.task.findUnique({
      where: { id: Number(id) }
    });

    if (!task) {
      return response.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    if (role !== 'ADMIN' && task.assigneeId !== userId) {
      return response.status(403).json({
        status: 'error',
        message: 'You can only update status of your own tasks'
      });
    }

    const updatedTask = await prisma.task.update({
      where: { id: Number(id) },
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

    return response.json({
      status: 'success',
      data: updatedTask
    });
  }
}