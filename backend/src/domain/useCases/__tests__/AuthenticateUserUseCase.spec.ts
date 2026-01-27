import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthenticateUserUseCase } from '@/domain/useCases/AuthenticateUserUseCase';
import { IUsersRepository } from '@/domain/repositories/IUsersRepository';
import * as bcrypt from 'bcryptjs';

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
}));

// Mock jsonwebtoken (default export)
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('mocked_jwt_token'),
  },
}));

const mockUsersRepository: IUsersRepository = {
  create: vi.fn(),
  findByEmail: vi.fn(),
  findById: vi.fn(),
  updatePassword: vi.fn(),
};

describe('AuthenticateUserUseCase', () => {
  let authenticateUserUseCase: AuthenticateUserUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    authenticateUserUseCase = new AuthenticateUserUseCase(mockUsersRepository);
  });

  it('should be able to authenticate with valid credentials', async () => {
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed_password',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockUsersRepository.findByEmail).mockResolvedValue(mockUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const result = await authenticateUserUseCase.execute({
      email: 'john@example.com',
      password: '123456',
    });

    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('user');
    expect(result.user).not.toHaveProperty('password');
    expect(result.user.email).toBe('john@example.com');
  });

  it('should not authenticate with invalid email', async () => {
    vi.mocked(mockUsersRepository.findByEmail).mockResolvedValue(null);

    await expect(
      authenticateUserUseCase.execute({
        email: 'nonexistent@example.com',
        password: '123456',
      })
    ).rejects.toThrow('E-mail ou senha incorretos');
  });

  it('should not authenticate with invalid password', async () => {
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed_password',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockUsersRepository.findByEmail).mockResolvedValue(mockUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    await expect(
      authenticateUserUseCase.execute({
        email: 'john@example.com',
        password: 'wrong_password',
      })
    ).rejects.toThrow('E-mail ou senha incorretos');
  });
});
