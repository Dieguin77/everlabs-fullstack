import { Router } from 'express';
import { TasksController } from '../controllers/TasksController.js';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated.js';
import { ensureAdmin } from '../middlewares/ensureAdmin.js';

const tasksRouter = Router();
const tasksController = new TasksController();

// Todas as rotas precisam de autenticação
tasksRouter.use(ensureAuthenticated);

// Rotas que qualquer usuário autenticado pode acessar
tasksRouter.get('/', tasksController.list);
tasksRouter.get('/:id', tasksController.findById);
tasksRouter.patch('/:id/status', tasksController.updateStatus);

// Rotas que apenas admin pode acessar
tasksRouter.post('/', ensureAdmin, tasksController.create);
tasksRouter.put('/:id', ensureAdmin, tasksController.update);
tasksRouter.delete('/:id', ensureAdmin, tasksController.delete);

export { tasksRouter };