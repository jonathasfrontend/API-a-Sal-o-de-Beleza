import { Request, Response } from 'express';
import { logger } from '../../../utils/logger';

export class WebhooksController {
  whatsapp = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('WhatsApp webhook received:', req.body);
      // Implementar lógica de processamento do webhook do WhatsApp
      res.json({ status: 'success' });
    } catch (error: any) {
      logger.error('Error processing WhatsApp webhook:', error);
      res.status(400).json({ status: 'error', message: error.message });
    }
  };

  payment = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('Payment webhook received:', req.body);
      // Implementar lógica de processamento do webhook de pagamento
      res.json({ status: 'success' });
    } catch (error: any) {
      logger.error('Error processing payment webhook:', error);
      res.status(400).json({ status: 'error', message: error.message });
    }
  };
}

export const webhooksController = new WebhooksController();
