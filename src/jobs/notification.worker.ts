import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { WhatsAppService } from '../services/whatsapp.service';
import { EmailService } from '../services/email.service';
import type { NotificationJob } from './queue';

const connection = new IORedis(env.redisUrl, {
  maxRetriesPerRequest: null,
});

const whatsappService = new WhatsAppService();
const emailService = new EmailService();

export const notificationWorker = new Worker(
  'notifications',
  async (job) => {
    const data = job.data as NotificationJob;
    logger.info(`Processing notification job: ${job.id}`);

    try {
      if (data.type === 'whatsapp') {
        await whatsappService.sendText(data.recipient, data.message);
      } else if (data.type === 'email') {
        await emailService.send({
          to: data.recipient,
          subject: 'Notificação',
          html: data.message,
        });
      }

      logger.info(`Notification sent successfully: ${job.id}`);
    } catch (error: any) {
      logger.error(`Notification job failed: ${job.id}`, error.message);
      throw error;
    }
  },
  { connection }
);

notificationWorker.on('completed', (job) => {
  logger.info(`Job ${job.id} completed`);
});

notificationWorker.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} failed:`, err.message);
});

logger.info('Notification worker started');
