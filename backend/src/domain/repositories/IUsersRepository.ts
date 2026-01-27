import { Prisma, User } from '@prisma/client';

// Data Transfer Object for creating a user. We derive this from Prisma's generated
// types to ensure consistency. We explicitly state the properties required.
export type CreateUserDTO = Pick<
  Prisma.UserCreateInput,
  'email' | 'name' | 'password' | 'role'
>;

// Token for dependency injection
export const IUsersRepository = Symbol('IUsersRepository');

export interface IUsersRepository {
  create(data: CreateUserDTO): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
}
