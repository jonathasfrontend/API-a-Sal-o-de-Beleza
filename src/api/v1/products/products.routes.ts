import { Router } from 'express';
import { productsController } from './products.controller';
import { authenticate } from '../../../middlewares/auth.jwt';
import { validateZod } from '../../../middlewares/validate';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createProductSchema = z.object({
  body: z.object({
    sku: z.string().min(1, 'SKU is required'),
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    category: z.string().min(1, 'Category is required'),
    quantity: z.number().int().min(0, 'Quantity cannot be negative'),
    costPrice: z.number().min(0, 'Cost price cannot be negative'),
    salePrice: z.number().min(0, 'Sale price cannot be negative'),
    reorderThreshold: z.number().int().min(0).optional(),
    supplier: z.string().optional(),
  }),
});

const updateProductSchema = z.object({
  body: z.object({
    sku: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    category: z.string().min(1).optional(),
    costPrice: z.number().min(0).optional(),
    salePrice: z.number().min(0).optional(),
    reorderThreshold: z.number().int().min(0).optional(),
    supplier: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

const stockMovementSchema = z.object({
  body: z.object({
    quantity: z.number().int().positive('Quantity must be positive'),
    reason: z.string().optional(),
    reference: z.string().optional(),
  }),
});

// Routes
router.post(
  '/',
  authenticate,
  validateZod(createProductSchema),
  productsController.create
);

router.get(
  '/',
  authenticate,
  productsController.list
);

router.get(
  '/:id',
  authenticate,
  productsController.getById
);

router.put(
  '/:id',
  authenticate,
  validateZod(updateProductSchema),
  productsController.update
);

router.delete(
  '/:id',
  authenticate,
  productsController.delete
);

router.post(
  '/:id/stock/add',
  authenticate,
  validateZod(stockMovementSchema),
  productsController.addStock
);

router.post(
  '/:id/stock/remove',
  authenticate,
  validateZod(stockMovementSchema),
  productsController.removeStock
);

router.get(
  '/:id/movements',
  authenticate,
  productsController.getMovements
);

export default router;
