import { Router } from 'express';
import { CommentsController } from '../controllers/CommentsController.js';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated.js';
import { validate } from '@/shared/middlewares/validate.js';
import { createCommentSchema, taskIdParamSchema, commentIdParamSchema } from '../schemas/comments.schemas.js';

const commentsRouter = Router();
const commentsController = new CommentsController();

// Todas as rotas requerem autenticação
commentsRouter.use(ensureAuthenticated);

commentsRouter.post(
	'/tasks/:taskId/comments',
	validate(taskIdParamSchema, 'params'),
	validate(createCommentSchema, 'body'),
	commentsController.create
);

commentsRouter.get(
	'/tasks/:taskId/comments',
	validate(taskIdParamSchema, 'params'),
	commentsController.listByTask
);

commentsRouter.delete(
	'/comments/:id',
	validate(commentIdParamSchema, 'params'),
	commentsController.delete
);

export { commentsRouter };