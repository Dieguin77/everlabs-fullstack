import { PrismaClient } from '@prisma/client';
import { withConnectionDefaults } from './connectionDefaults.js';

const databaseUrl = process.env.DATABASE_URL;

// Fail-fast timeouts (see connectionDefaults.ts). Without DATABASE_URL (e.g. unit tests)
// the default client is created and nothing connects until a query is made.
export const prisma = new PrismaClient(
  databaseUrl ? { datasources: { db: { url: withConnectionDefaults(databaseUrl) } } } : undefined,
);
