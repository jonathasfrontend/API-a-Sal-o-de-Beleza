import { Router } from 'express';
import { salesController } from './sales.controller';
import { authenticate } from '../../../middlewares/auth.jwt';
import { validateZod } from '../../../middlewares/validate';
import { z } from 'zod';

const router = Router();

const createSaleSchema = z.object({
  body: z.object({
    clientId: z.string().uuid().optional(),
    items: z.array(z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
      unitPrice: z.number().positive(),
    })).min(1, 'At least one item is required'),
    paymentMethod: z.enum(['CASH', 'DEBIT', 'CREDIT', 'PIX', 'LINK', 'WALLET']),
  }),
});

router.post('/', authenticate, validateZod(createSaleSchema), salesController.create);
router.get('/', authenticate, salesController.list);
router.get('/:id', authenticate, salesController.getById);

export default router;
