import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const connection = new IORedis(env.redisUrl, {
  maxRetriesPerRequest: null,
});

// Queue definitions
export const notificationQueue = new Queue('notifications', { connection });
export const paymentQueue = new Queue('payments', { connection });
export const reportQueue = new Queue('reports', { connection });

// Job types
export interface NotificationJob {
  type: 'whatsapp' | 'email' | 'sms';
  recipient: string;
  message: string;
  appointmentId?: string;
}

export interface PaymentJob {
  paymentId: string;
  action: 'process' | 'refund';
}

export interface ReportJob {
  type: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
}

// Add jobs to queue
export const addNotificationJob = async (data: NotificationJob, delay?: number) => {
  return await notificationQueue.add('send-notification', data, {
    delay,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
};

export const addPaymentJob = async (data: PaymentJob) => {
  return await paymentQueue.add('process-payment', data, {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  });
};

export const addReportJob = async (data: ReportJob) => {
  return await reportQueue.add('generate-report', data);
};

// Schedule reminder jobs
export const scheduleReminder = async (
  appointmentId: string,
  clientPhone: string,
  _clientName: string,
  appointmentDate: Date,
  hoursBefor: number
) => {
  const reminderTime = new Date(appointmentDate);
  reminderTime.setHours(reminderTime.getHours() - hoursBefor);

  const delay = reminderTime.getTime() - Date.now();

  if (delay > 0) {
    await addNotificationJob(
      {
        type: 'whatsapp',
        recipient: clientPhone,
        message: `Lembrete: Você tem agendamento em ${hoursBefor}h`,
        appointmentId,
      },
      delay
    );
  }
};

logger.info('Queue system initialized');
