import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Get role-filtered activity feed (or catch-up for offline users)
router.get('/', ActivityController.getActivities);

// Get activities for a specific project
router.get('/project/:projectId', ActivityController.getProjectActivities);

export default router;
