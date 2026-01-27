import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { FilesController } from '../controllers/FilesController.js';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated.js';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(process.cwd(), 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

const filesRouter = Router();
const filesController = new FilesController();

// All routes require authentication
filesRouter.use(ensureAuthenticated);

// @route   POST /api/files/tasks/:taskId
// @desc    Upload a file to a task
// @access  Private (Admin or Task Assignee)
filesRouter.post('/tasks/:taskId', upload.single('file'), filesController.upload);

// @route   GET /api/files/tasks/:taskId
// @desc    List all files for a task
// @access  Private (Admin or Task Assignee)
filesRouter.get('/tasks/:taskId', filesController.listByTask);

// @route   GET /api/files/:id/download
// @desc    Download a file
// @access  Private (Admin or Task Assignee)
filesRouter.get('/:id/download', filesController.download);

// @route   DELETE /api/files/:id
// @desc    Delete a file
// @access  Private (Admin or File Uploader)
filesRouter.delete('/:id', filesController.delete);

export { filesRouter };
