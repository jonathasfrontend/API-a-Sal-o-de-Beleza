import { Router } from 'express';
import { webhooksController } from './webhooks.controller';

const router = Router();

router.post('/whatsapp', webhooksController.whatsapp);
router.post('/payment', webhooksController.payment);

export default router;
