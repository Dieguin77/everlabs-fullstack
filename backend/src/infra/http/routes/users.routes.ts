import { Router } from 'express';
import { UsersController } from '../controllers/UsersController.js';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated.js';
import { ensureAdmin } from '../middlewares/ensureAdmin.js';

const usersRouter = Router();
const usersController = new UsersController();

// @route   POST /api/users
// @desc    Create a new user
// @access  Public (for initial admin setup) or Admin only
usersRouter.post('/', usersController.create);

// @route   POST /api/users/authenticate
// @desc    Authenticate user and get token
// @access  Public
usersRouter.post('/authenticate', usersController.authenticate);

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
usersRouter.get('/me', ensureAuthenticated, usersController.getProfile);

// @route   GET /api/users
// @desc    List all users
// @access  Admin only
usersRouter.get('/', ensureAuthenticated, ensureAdmin, usersController.listAll);

// @route   PUT /api/users/password
// @desc    Change user password
// @access  Private
usersRouter.put('/password', ensureAuthenticated, usersController.changePassword);

export { usersRouter };
