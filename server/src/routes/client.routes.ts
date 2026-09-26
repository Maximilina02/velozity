import { Router } from 'express';
import {
  ClientController,
  createClientSchema,
  updateClientSchema,
} from '../controllers/client.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdminOrPM } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/', ClientController.getClients);
router.post(
  '/',
  requireAdminOrPM,
  validateRequest({ body: createClientSchema }),
  ClientController.createClient
);
router.put(
  '/:id',
  requireAdminOrPM,
  validateRequest({ body: updateClientSchema }),
  ClientController.updateClient
);
router.delete('/:id', requireAdminOrPM, ClientController.deleteClient);

export default router;
