import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateUserUseCase } from '@/domain/useCases/CreateUserUseCase';
import { IUsersRepository, CreateUserDTO } from '@/domain/repositories/IUsersRepository';
import { IHashProvider } from '@/domain/providers/IHashProvider';
import { AppError } from '@/shared/errors/AppError';

// Mock implementations
const mockUsersRepository: IUsersRepository = {
  create: vi.fn(),
  findByEmail: vi.fn(),
  findById: vi.fn(),
  updatePassword: vi.fn(),
};

const mockHashProvider: IHashProvider = {
  generateHash: vi.fn(),
  compareHash: vi.fn(),
};

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create use case with mocked dependencies
    createUserUseCase = new CreateUserUseCase(
      mockUsersRepository,
      mockHashProvider
    );
  });

  it('should be able to create a new user', async () => {
    const userData: CreateUserDTO = {
      name: 'John Doe',
      email: 'john@example.com',
      password: '123456',
      role: 'USER',
    };

    const hashedPassword = 'hashed_password_123';
    const createdUser = {
      id: 1,
      ...userData,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockUsersRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(mockHashProvider.generateHash).mockResolvedValue(hashedPassword);
    vi.mocked(mockUsersRepository.create).mockResolvedValue(createdUser);

    const result = await createUserUseCase.execute(userData);

    expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(userData.email);
    expect(mockHashProvider.generateHash).toHaveBeenCalledWith(userData.password);
    expect(mockUsersRepository.create).toHaveBeenCalledWith({
      ...userData,
      password: hashedPassword,
    });
    expect(result).not.toHaveProperty('password');
    expect(result.email).toBe(userData.email);
  });

  it('should not be able to create user with existing email', async () => {
    const userData: CreateUserDTO = {
      name: 'John Doe',
      email: 'existing@example.com',
      password: '123456',
      role: 'USER',
    };

    vi.mocked(mockUsersRepository.findByEmail).mockResolvedValue({
      id: 1,
      name: 'Existing User',
      email: 'existing@example.com',
      password: 'hashed',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(createUserUseCase.execute(userData)).rejects.toThrow(AppError);
    expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(userData.email);
    expect(mockHashProvider.generateHash).not.toHaveBeenCalled();
    expect(mockUsersRepository.create).not.toHaveBeenCalled();
  });

  it('should hash the password before saving', async () => {
    const userData: CreateUserDTO = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'plain_password',
      role: 'USER',
    };

    const hashedPassword = 'super_secure_hash';

    vi.mocked(mockUsersRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(mockHashProvider.generateHash).mockResolvedValue(hashedPassword);
    vi.mocked(mockUsersRepository.create).mockResolvedValue({
      id: 1,
      ...userData,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await createUserUseCase.execute(userData);

    expect(mockHashProvider.generateHash).toHaveBeenCalledWith('plain_password');
    expect(mockUsersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ password: hashedPassword })
    );
  });
});
