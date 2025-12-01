import { Router } from 'express';
import { expensesController } from './expenses.controller';
import { authenticate } from '../../../middlewares/auth.jwt';
import { validateZod } from '../../../middlewares/validate';
import { z } from 'zod';

const router = Router();

const createExpenseSchema = z.object({
  body: z.object({
    description: z.string().min(1, 'Description is required'),
    category: z.string().min(1, 'Category is required'),
    amount: z.number().positive('Amount must be positive'),
    dueDate: z.string().transform(str => new Date(str)),
    isRecurring: z.boolean().optional(),
    notes: z.string().optional(),
  }),
});

const updateExpenseSchema = z.object({
  body: z.object({
    description: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    amount: z.number().positive().optional(),
    dueDate: z.string().transform(str => new Date(str)).optional(),
    isRecurring: z.boolean().optional(),
    notes: z.string().optional(),
  }),
});

router.post('/', authenticate, validateZod(createExpenseSchema), expensesController.create);
router.get('/', authenticate, expensesController.list);
router.get('/:id', authenticate, expensesController.getById);
router.put('/:id', authenticate, validateZod(updateExpenseSchema), expensesController.update);
router.post('/:id/pay', authenticate, expensesController.markAsPaid);
router.delete('/:id', authenticate, expensesController.delete);

export default router;
