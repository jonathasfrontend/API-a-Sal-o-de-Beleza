import { Router } from 'express';
import { servicesController } from './services.controller';
import { authenticate } from '../../../middlewares/auth.jwt';
import { validateZod } from '../../../middlewares/validate';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createServiceSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    durationMinutes: z.number().int().positive('Duration must be positive'),
    price: z.number().positive('Price must be positive'),
    category: z.string().min(1, 'Category is required'),
    allowsCombo: z.boolean().optional(),
  }),
});

const updateServiceSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    durationMinutes: z.number().int().positive().optional(),
    price: z.number().positive().optional(),
    category: z.string().min(1).optional(),
    isActive: z.boolean().optional(),
    allowsCombo: z.boolean().optional(),
  }),
});

// Routes
router.post(
  '/',
  authenticate,
  validateZod(createServiceSchema),
  servicesController.create
);

router.get(
  '/',
  authenticate,
  servicesController.list
);

router.get(
  '/categories',
  authenticate,
  servicesController.listCategories
);

router.get(
  '/:id',
  authenticate,
  servicesController.getById
);

router.put(
  '/:id',
  authenticate,
  validateZod(updateServiceSchema),
  servicesController.update
);

router.delete(
  '/:id',
  authenticate,
  servicesController.delete
);

export default router;
