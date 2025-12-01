import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { logger } from './utils/logger';
import { errorHandler } from './middlewares/error.handler';

// Import routes
import authRoutes from './api/v1/auth/auth.routes';
import clientsRoutes from './api/v1/clients/clients.routes';
import appointmentsRoutes from './api/v1/appointments/appointments.routes';
import servicesRoutes from './api/v1/services/services.routes';
import staffRoutes from './api/v1/staff/staff.routes';
import paymentsRoutes from './api/v1/payments/payments.routes';
import productsRoutes from './api/v1/products/products.routes';
import salesRoutes from './api/v1/sales/sales.routes';
import expensesRoutes from './api/v1/expenses/expenses.routes';
import reportsRoutes from './api/v1/reports/reports.routes';
import webhooksRoutes from './api/v1/webhooks/webhooks.routes';
import reviewsRoutes from './api/v1/reviews/reviews.routes';
import waitlistRoutes from './api/v1/waitlist/waitlist.routes';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: env.corsOrigins,
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Request logging
app.use((req: Request, _res: Response, next) => {
  logger.http(`${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/clients', clientsRoutes);
app.use('/api/v1/appointments', appointmentsRoutes);
app.use('/api/v1/services', servicesRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/payments', paymentsRoutes);
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/sales', salesRoutes);
app.use('/api/v1/expenses', expensesRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/webhooks', webhooksRoutes);
app.use('/api/v1/reviews', reviewsRoutes);
app.use('/api/v1/waitlist', waitlistRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
