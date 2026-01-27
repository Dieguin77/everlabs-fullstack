import { Router } from 'express';
import { TagsController } from '../controllers/TagsController.js';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated.js';
import { ensureAdmin } from '../middlewares/ensureAdmin.js';

const tagsRouter = Router();
const tagsController = new TagsController();

// All routes require authentication
tagsRouter.use(ensureAuthenticated);

// @route   POST /api/tags
// @desc    Create a new tag
// @access  Admin only
tagsRouter.post('/', ensureAdmin, tagsController.create);

// @route   GET /api/tags
// @desc    List all tags
// @access  Private
tagsRouter.get('/', tagsController.list);

// @route   DELETE /api/tags/:id
// @desc    Delete a tag
// @access  Admin only
tagsRouter.delete('/:id', ensureAdmin, tagsController.delete);

// @route   POST /api/tags/tasks/:taskId/tags/:tagId
// @desc    Add a tag to a task
// @access  Private (Admin or Task Assignee)
tagsRouter.post('/tasks/:taskId/tags/:tagId', tagsController.addToTask);

// @route   DELETE /api/tags/tasks/:taskId/tags/:tagId
// @desc    Remove a tag from a task
// @access  Private (Admin or Task Assignee)
tagsRouter.delete('/tasks/:taskId/tags/:tagId', tagsController.removeFromTask);

// @route   GET /api/tags/tasks/:taskId
// @desc    List all tags for a task
// @access  Private (Admin or Task Assignee)
tagsRouter.get('/tasks/:taskId', tagsController.listByTask);

export { tagsRouter };
