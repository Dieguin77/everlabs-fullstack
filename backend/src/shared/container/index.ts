import 'reflect-metadata';
import { container } from 'tsyringe';

import { IUsersRepository } from '@/domain/repositories/IUsersRepository';
import { PrismaUsersRepository } from '@/infra/database/repositories/PrismaUsersRepository';

import { ITasksRepository } from '@/domain/repositories/ITasksRepository';
import { PrismaTasksRepository } from '@/infra/database/repositories/PrismaTasksRepository';

import { ICommentsRepository } from '@/domain/repositories/ICommentsRepository';
import { PrismaCommentsRepository } from '@/infra/database/repositories/PrismaCommentsRepository';

import { IFilesRepository } from '@/domain/repositories/IFilesRepository';
import { PrismaFilesRepository } from '@/infra/database/repositories/PrismaFilesRepository';

import { ITagsRepository } from '@/domain/repositories/ITagsRepository';
import { PrismaTagsRepository } from '@/infra/database/repositories/PrismaTagsRepository';

import { IHashProvider } from '@/domain/providers/IHashProvider';
import { BcryptHashProvider } from '@/infra/providers/hash/BcryptHashProvider';

// ============== Providers ==============
container.registerSingleton<IHashProvider>(
  'HashProvider',
  BcryptHashProvider
);


// ============ Repositories ============
container.registerSingleton<IUsersRepository>(
  'UsersRepository',
  PrismaUsersRepository
);

container.registerSingleton<ITasksRepository>(
  'TasksRepository',
  PrismaTasksRepository
);

container.registerSingleton<ICommentsRepository>(
  'CommentsRepository',
  PrismaCommentsRepository
);

container.registerSingleton<IFilesRepository>(
  'FilesRepository',
  PrismaFilesRepository
);

container.registerSingleton<ITagsRepository>(
  'TagsRepository',
  PrismaTagsRepository
);
