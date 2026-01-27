import { IUser } from '@/domain/entities/interfaces.js';
import { IUsersRepository } from '@/domain/repositories/IUsersRepository.js';
import { AppError } from '@/shared/errors/AppError.js';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { inject, injectable } from 'tsyringe';

interface IAuthenticateUserDTO {
  email: string;
  password: string;
}

interface IAuthenticateUserResponse {
  user: Omit<IUser, 'password'>;
  token: string;
}

@injectable()
export class AuthenticateUserUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository
  ) {}

  async execute({ email, password }: IAuthenticateUserDTO): Promise<IAuthenticateUserResponse> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new AppError('E-mail ou senha incorretos', 401);
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new AppError('E-mail ou senha incorretos', 401);
    }

    const payload = {
      userId: user.id,
      role: user.role,
    };

    const jwtSecret = process.env.JWT_SECRET ?? 'default';
    const expiresIn = process.env.JWT_EXPIRES_IN ?? '1d';

    const token = jwt.sign(payload, jwtSecret, {
      subject: String(user.id),
      expiresIn,
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }
}