import { inject, injectable } from 'tsyringe';
import { IUsersRepository } from '@/domain/repositories/IUsersRepository.js';
import { IHashProvider } from '@/domain/providers/IHashProvider.js';
import { AppError } from '@/shared/errors/AppError.js';

interface IChangePasswordDTO {
  userId: number;
  currentPassword: string;
  newPassword: string;
}

@injectable()
export class ChangePasswordUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
    @inject('HashProvider')
    private hashProvider: IHashProvider
  ) {}

  async execute({ userId, currentPassword, newPassword }: IChangePasswordDTO): Promise<void> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const passwordMatches = await this.hashProvider.compareHash(
      currentPassword,
      user.password
    );

    if (!passwordMatches) {
      throw new AppError('Senha atual incorreta', 401);
    }

    if (newPassword.length < 6) {
      throw new AppError('A nova senha deve ter pelo menos 6 caracteres', 400);
    }

    const hashedPassword = await this.hashProvider.generateHash(newPassword);

    await this.usersRepository.updatePassword(userId, hashedPassword);
  }
}
