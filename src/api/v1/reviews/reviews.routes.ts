import { Router } from 'express';
import { reviewsController } from './reviews.controller';
import { authenticate } from '../../../middlewares/auth.jwt';
import { validateZod } from '../../../middlewares/validate';
import { z } from 'zod';

const router = Router();

const createReviewSchema = z.object({
  body: z.object({
    clientId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
    serviceQuality: z.number().int().min(1).max(5).optional(),
    staffBehavior: z.number().int().min(1).max(5).optional(),
    cleanliness: z.number().int().min(1).max(5).optional(),
  }),
});

router.post('/', authenticate, validateZod(createReviewSchema), reviewsController.create);
router.get('/', authenticate, reviewsController.list);
router.get('/stats', authenticate, reviewsController.getStats);

export default router;
