import { Router } from 'express';
import { staffController } from './staff.controller';
import { authenticate } from '../../../middlewares/auth.jwt';
import { validateZod } from '../../../middlewares/validate';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createStaffSchema = z.object({
  body: z.object({
    userId: z.string().uuid('Invalid user ID'),
    specialties: z.array(z.string()).min(1, 'At least one specialty is required'),
    commissionType: z.enum(['PERCENT', 'FIXED', 'TABLE']).optional(),
    commissionValue: z.number().min(0).optional(),
    workSchedule: z.any().optional(),
    blockedDates: z.any().optional(),
  }),
});

const updateStaffSchema = z.object({
  body: z.object({
    specialties: z.array(z.string()).min(1).optional(),
    commissionType: z.enum(['PERCENT', 'FIXED', 'TABLE']).optional(),
    commissionValue: z.number().min(0).optional(),
    workSchedule: z.any().optional(),
    blockedDates: z.any().optional(),
    isAvailable: z.boolean().optional(),
  }),
});

// Routes
router.post(
  '/',
  authenticate,
  validateZod(createStaffSchema),
  staffController.create
);

router.get(
  '/',
  authenticate,
  staffController.list
);

router.get(
  '/:id',
  authenticate,
  staffController.getById
);

router.get(
  '/:id/availability',
  authenticate,
  staffController.checkAvailability
);

router.get(
  '/:id/schedule',
  authenticate,
  staffController.getSchedule
);

router.put(
  '/:id',
  authenticate,
  validateZod(updateStaffSchema),
  staffController.update
);

router.delete(
  '/:id',
  authenticate,
  staffController.delete
);

export default router;
