import { Router } from 'express';
import { paymentsController } from './payments.controller';
import { authenticate } from '../../../middlewares/auth.jwt';
import { validateZod } from '../../../middlewares/validate';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createPaymentSchema = z.object({
  body: z.object({
    appointmentId: z.string().uuid().optional(),
    clientId: z.string().uuid('Invalid client ID'),
    amount: z.number().positive('Amount must be positive'),
    method: z.enum(['CASH', 'DEBIT', 'CREDIT', 'PIX', 'LINK', 'WALLET']),
    gatewayReference: z.string().optional(),
  }),
});

// Routes
router.post(
  '/',
  authenticate,
  validateZod(createPaymentSchema),
  paymentsController.create
);

router.get(
  '/',
  authenticate,
  paymentsController.list
);

router.get(
  '/report',
  authenticate,
  paymentsController.report
);

router.get(
  '/:id',
  authenticate,
  paymentsController.getById
);

router.post(
  '/:id/confirm',
  authenticate,
  paymentsController.confirm
);

router.post(
  '/:id/refund',
  authenticate,
  paymentsController.refund
);

export default router;
