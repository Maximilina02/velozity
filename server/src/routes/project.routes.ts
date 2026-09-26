import { Router } from 'express';
import {
  ProjectController,
  createProjectSchema,
  updateProjectSchema,
} from '../controllers/project.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdminOrPM } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

// All project endpoints require authentication
router.use(authenticate);

// List projects (role-filtered in controller)
router.get('/', ProjectController.getProjects);

// Get specific project (ownership enforced)
router.get('/:id', ProjectController.getProjectById);

// Create project (Admin or PM only)
router.post(
  '/',
  requireAdminOrPM,
  validateRequest({ body: createProjectSchema }),
  ProjectController.createProject
);

// Update project (Admin or PM owner only)
router.put(
  '/:id',
  requireAdminOrPM,
  validateRequest({ body: updateProjectSchema }),
  ProjectController.updateProject
);

// Delete project (Admin or PM owner only)
router.delete('/:id', requireAdminOrPM, ProjectController.deleteProject);

export default router;
