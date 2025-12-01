import { Router } from 'express';
import { staffController } from './staff.controller';
import { authenticate, checkPermission } from '../../../middlewares/auth.jwt';
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
  checkPermission('staff.create'),
  validateZod(createStaffSchema),
  staffController.create
);

router.get(
  '/',
  authenticate,
  checkPermission('staff.read'),
  staffController.list
);

router.get(
  '/:id',
  authenticate,
  checkPermission('staff.read'),
  staffController.getById
);

router.get(
  '/:id/availability',
  authenticate,
  checkPermission('staff.read'),
  staffController.checkAvailability
);

router.get(
  '/:id/schedule',
  authenticate,
  checkPermission('staff.read'),
  staffController.getSchedule
);

router.put(
  '/:id',
  authenticate,
  checkPermission('staff.update'),
  validateZod(updateStaffSchema),
  staffController.update
);

router.delete(
  '/:id',
  authenticate,
  checkPermission('staff.delete'),
  staffController.delete
);

router.post(
  '/:id/assign-role',
  authenticate,
  checkPermission('roles.assign'),
  staffController.assignRole
);

export default router;
