import { Router } from 'express';
import { usersRouter } from '../infra/http/routes/users.routes.js';
import { tasksRouter } from '../infra/http/routes/tasks.routes.js';
import { commentsRouter } from '../infra/http/routes/comments.routes.js';
import { filesRouter } from '../infra/http/routes/files.routes.js';
import { tagsRouter } from '../infra/http/routes/tags.routes.js';

const router = Router();

// All user-related routes are prefixed with /users
router.use('/users', usersRouter);

// Task management routes
router.use('/tasks', tasksRouter);

// Comment routes (includes nested paths like /tasks/:taskId/comments)
router.use('/', commentsRouter);

// File upload routes
router.use('/files', filesRouter);

// Tag management routes
router.use('/tags', tagsRouter);

export { router };
