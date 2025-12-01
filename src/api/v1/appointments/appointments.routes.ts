import { Router } from 'express';
import * as appointmentsController from './appointments.controller';
import { authenticate, authorize } from '../../../middlewares/auth.jwt';
import { validateZod } from '../../../middlewares/validate';
import { z } from 'zod';

const router = Router();

// Validation schemas
const serviceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  price: z.number().positive(),
  duration: z.number().positive(),
});

const createAppointmentSchema = z.object({
  body: z.object({
    clientId: z.string().uuid(),
    staffId: z.string().uuid(),
    startTime: z.string().datetime(),
    services: z.array(serviceSchema).min(1),
    notes: z.string().optional(),
  }),
});

const updateAppointmentSchema = z.object({
  body: z.object({
    staffId: z.string().uuid().optional(),
    startTime: z.string().datetime().optional(),
    status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
    notes: z.string().optional(),
    isPaid: z.boolean().optional(),
  }),
});

// All routes require authentication
router.use(authenticate);

// Routes
router.post(
  '/',
  authorize('ADMIN', 'MANAGER', 'RECEPTION'),
  validateZod(createAppointmentSchema),
  appointmentsController.createAppointment
);

router.get(
  '/',
  authorize('ADMIN', 'MANAGER', 'RECEPTION', 'STAFF'),
  appointmentsController.getAppointments
);

router.get(
  '/availability',
  authorize('ADMIN', 'MANAGER', 'RECEPTION', 'STAFF'),
  appointmentsController.checkAvailability
);

router.get(
  '/stats',
  authorize('ADMIN', 'MANAGER'),
  appointmentsController.getStats
);

router.get(
  '/:id',
  authorize('ADMIN', 'MANAGER', 'RECEPTION', 'STAFF'),
  appointmentsController.getAppointment
);

router.put(
  '/:id',
  authorize('ADMIN', 'MANAGER', 'RECEPTION'),
  validateZod(updateAppointmentSchema),
  appointmentsController.updateAppointment
);

router.post(
  '/:id/cancel',
  authorize('ADMIN', 'MANAGER', 'RECEPTION'),
  appointmentsController.cancelAppointment
);

router.post(
  '/:id/no-show',
  authorize('ADMIN', 'MANAGER', 'RECEPTION'),
  appointmentsController.markNoShow
);

export default router;
