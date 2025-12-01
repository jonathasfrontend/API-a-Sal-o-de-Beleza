import { Router } from 'express';
import { waitlistController } from './waitlist.controller';
import { authenticate } from '../../../middlewares/auth.jwt';
import { validateZod } from '../../../middlewares/validate';
import { z } from 'zod';

const router = Router();

const createWaitlistSchema = z.object({
  body: z.object({
    clientName: z.string().min(1),
    clientPhone: z.string().min(1),
    serviceId: z.string().uuid(),
    preferredDate: z.string().transform(str => new Date(str)).optional(),
    notes: z.string().optional(),
  }),
});

router.post('/', authenticate, validateZod(createWaitlistSchema), waitlistController.create);
router.get('/', authenticate, waitlistController.list);
router.post('/:id/contact', authenticate, waitlistController.markAsContacted);
router.delete('/:id', authenticate, waitlistController.delete);

export default router;
