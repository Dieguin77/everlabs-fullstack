import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Content is required'),
});

export const taskIdParamSchema = z.object({
  taskId: z.coerce.number().int().positive(),
});

export const commentIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
