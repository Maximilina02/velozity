import { Router } from 'express';
import {
  TaskController,
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdminOrPM } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

router.use(authenticate);

// Get tasks list (with shareable query parameter filters)
router.get('/', TaskController.getTasks);

// Get task by ID
router.get('/:id', TaskController.getTaskById);

// Create task (Admin or PM only)
router.post(
  '/',
  requireAdminOrPM,
  validateRequest({ body: createTaskSchema }),
  TaskController.createTask
);

// Update task details (Admin or PM only)
router.put(
  '/:id',
  requireAdminOrPM,
  validateRequest({ body: updateTaskSchema }),
  TaskController.updateTask
);

// Update task status (Admin, PM owner, or Assigned Developer)
router.patch(
  '/:id/status',
  validateRequest({ body: updateTaskStatusSchema }),
  TaskController.updateTaskStatus
);

// Delete task (Admin or PM owner only)
router.delete('/:id', requireAdminOrPM, TaskController.deleteTask);

export default router;
