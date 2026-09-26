import { Router } from 'express';
import { AuthController, loginSchema } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', validateRequest({ body: loginSchema }), AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);
router.get('/me', authenticate, AuthController.me);

export default router;
