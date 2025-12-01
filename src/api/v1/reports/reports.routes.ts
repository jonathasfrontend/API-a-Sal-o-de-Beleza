import { Router } from 'express';
import { reportsController } from './reports.controller';
import { authenticate } from '../../../middlewares/auth.jwt';

const router = Router();

router.get('/dashboard', authenticate, reportsController.dashboard);
router.get('/financial', authenticate, reportsController.financial);
router.get('/commissions', authenticate, reportsController.commissions);

export default router;
