import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { CreateUserUseCase } from '@/domain/useCases/CreateUserUseCase';
import { AuthenticateUserUseCase } from '@/domain/useCases/AuthenticateUserUseCase';
import { ChangePasswordUseCase } from '@/domain/useCases/ChangePasswordUseCase';
import { createUserBodySchema, authenticateUserSchema } from '../schemas/users.schemas';
import { prisma } from '@/infra/database/prisma';

export class UsersController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { name, email, password, role } = createUserBodySchema.parse(
      request.body
    );

    const createUserUseCase = container.resolve(CreateUserUseCase);

    const user = await createUserUseCase.execute({
      name,
      email,
      password,
      role,
    });

    return response.status(201).json({
      status: 'success',
      data: user
    });
  }

  public async authenticate(request: Request, response: Response): Promise<Response> {
    const { email, password } = authenticateUserSchema.parse(request.body);

    const authenticateUserUseCase = container.resolve(AuthenticateUserUseCase);

    const { user, token } = await authenticateUserUseCase.execute({
      email,
      password,
    });

    return response.json({
      status: 'success',
      data: {
        user,
        token
      }
    });
  }

  public async getProfile(request: Request, response: Response): Promise<Response> {
    const { id } = request.user;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return response.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    return response.json({
      status: 'success',
      data: user
    });
  }

  public async listAll(request: Request, response: Response): Promise<Response> {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            assignedTasks: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return response.json({
      status: 'success',
      data: users
    });
  }

  public async changePassword(request: Request, response: Response): Promise<Response> {
    const { id } = request.user;
    const { currentPassword, newPassword } = request.body;

    if (!currentPassword || !newPassword) {
      return response.status(400).json({
        status: 'error',
        message: 'Senha atual e nova senha são obrigatórias'
      });
    }

    const changePasswordUseCase = container.resolve(ChangePasswordUseCase);

    await changePasswordUseCase.execute({
      userId: id,
      currentPassword,
      newPassword,
    });

    return response.json({
      status: 'success',
      message: 'Senha alterada com sucesso'
    });
  }
}
