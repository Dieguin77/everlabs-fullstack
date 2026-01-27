import { z } from 'zod';

export const createUserBodySchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'USER']).optional().default('USER'),
});

export const authenticateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
