import 'dotenv/config';
import { Prisma } from '@prisma/client';

export default {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL,
  },
};
