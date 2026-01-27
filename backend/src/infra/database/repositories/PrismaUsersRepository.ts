import { User } from '@prisma/client';
import {
  CreateUserDTO,
  IUsersRepository,
} from '@/domain/repositories/IUsersRepository';
import { prisma } from '../prisma';

export class PrismaUsersRepository implements IUsersRepository {
  public async create(data: CreateUserDTO): Promise<User> {
    const user = await prisma.user.create({
      data,
    });
    return user;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    return user;
  }

  public async findById(id: number): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  }
}
