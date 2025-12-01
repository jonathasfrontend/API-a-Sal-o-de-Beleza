import { Router } from 'express';
import * as clientsController from './clients.controller';
import { authenticate, checkPermission } from '../../../middlewares/auth.jwt';
import { validateZod } from '../../../middlewares/validate';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createClientSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(10, 'Phone must be at least 10 characters'),
    email: z.string().email().optional(),
    birthdate: z.string().datetime().optional(),
    cpf: z.string().length(11).optional(),
    notes: z.string().optional(),
    preferences: z.any().optional(),
    consentLGPD: z.boolean().optional(),
  }),
});

const updateClientSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().min(10).optional(),
    email: z.string().email().optional(),
    birthdate: z.string().datetime().optional(),
    cpf: z.string().length(11).optional(),
    notes: z.string().optional(),
    preferences: z.any().optional(),
    isBlocked: z.boolean().optional(),
  }),
});

// All routes require authentication
router.use(authenticate);

// Routes
router.post(
  '/',
  checkPermission('clients.create'),
  validateZod(createClientSchema),
  clientsController.createClient
);

router.get(
  '/',
  checkPermission('clients.read'),
  clientsController.getClients
);

router.get(
  '/inactive',
  checkPermission('clients.read'),
  clientsController.getInactiveClients
);

router.get(
  '/:id',
  checkPermission('clients.read'),
  clientsController.getClient
);

router.put(
  '/:id',
  checkPermission('clients.update'),
  validateZod(updateClientSchema),
  clientsController.updateClient
);

router.delete(
  '/:id',
  checkPermission('clients.delete'),
  clientsController.deleteClient
);

router.get(
  '/:id/history',
  checkPermission('clients.read'),
  clientsController.getClientHistory
);

export default router;
