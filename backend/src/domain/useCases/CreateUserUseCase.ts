import { inject, injectable } from 'tsyringe';
import { User } from '@prisma/client';

import { AppError } from '../../shared/errors/AppError.js';
import { IUsersRepository, CreateUserDTO } from '../repositories/IUsersRepository.js';
import { IHashProvider } from '../providers/IHashProvider.js';

@injectable()
export class CreateUserUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('HashProvider')
    private hashProvider: IHashProvider
  ) {}

  async execute({
    name,
    email,
    password,
    role,
  }: CreateUserDTO): Promise<Omit<User, 'password'>> {
    const userWithSameEmail = await this.usersRepository.findByEmail(email);

    if (userWithSameEmail) {
      throw new AppError('User with this email already exists.');
    }

    const hashedPassword = await this.hashProvider.generateHash(password);

    const user = await this.usersRepository.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }
}
