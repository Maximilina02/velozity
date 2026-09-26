import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireAdminOrPM } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

router.get('/developers', requireAdminOrPM, UserController.getDevelopers);
router.get('/clients', requireAdminOrPM, UserController.getClients);
router.get('/', requireAdmin, UserController.getAllUsers);

export default router;
