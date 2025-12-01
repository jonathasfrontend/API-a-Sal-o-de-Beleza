import { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import { logger } from '../../../utils/logger';

export class PaymentsController {
  private paymentsService: PaymentsService;

  constructor() {
    this.paymentsService = new PaymentsService();
  }

  /**
   * Criar um novo pagamento
   * POST /api/v1/payments
   */
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const payment = await this.paymentsService.create(req.body);
      
      logger.info(`Payment created: ${payment.id}`);
      
      res.status(201).json({
        status: 'success',
        data: { payment },
      });
    } catch (error: any) {
      logger.error('Error creating payment:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to create payment',
      });
    }
  };

  /**
   * Listar pagamentos
   * GET /api/v1/payments
   */
  list = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, method, clientId, startDate, endDate } = req.query;
      
      const filters: any = {};
      if (status) filters.status = status as string;
      if (method) filters.method = method as string;
      if (clientId) filters.clientId = clientId as string;
      if (startDate || endDate) {
        filters.dateRange = {
          start: startDate ? new Date(startDate as string) : undefined,
          end: endDate ? new Date(endDate as string) : undefined,
        };
      }

      const payments = await this.paymentsService.list(filters);
      
      res.json({
        status: 'success',
        data: payments,
      });
    } catch (error: any) {
      logger.error('Error listing payments:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to list payments',
      });
    }
  };

  /**
   * Buscar pagamento por ID
   * GET /api/v1/payments/:id
   */
  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const payment = await this.paymentsService.getById(id);
      
      if (!payment) {
        res.status(404).json({
          status: 'error',
          message: 'Payment not found',
        });
        return;
      }

      res.json({
        status: 'success',
        data: { payment },
      });
    } catch (error: any) {
      logger.error('Error getting payment:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to get payment',
      });
    }
  };

  /**
   * Confirmar pagamento
   * POST /api/v1/payments/:id/confirm
   */
  confirm = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const payment = await this.paymentsService.confirm(id);
      
      logger.info(`Payment confirmed: ${id}`);
      
      res.json({
        status: 'success',
        data: { payment },
      });
    } catch (error: any) {
      logger.error('Error confirming payment:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to confirm payment',
      });
    }
  };

  /**
   * Reembolsar pagamento
   * POST /api/v1/payments/:id/refund
   */
  refund = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const payment = await this.paymentsService.refund(id);
      
      logger.info(`Payment refunded: ${id}`);
      
      res.json({
        status: 'success',
        data: { payment },
      });
    } catch (error: any) {
      logger.error('Error refunding payment:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to refund payment',
      });
    }
  };

  /**
   * Relatório de pagamentos
   * GET /api/v1/payments/report
   */
  report = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        res.status(400).json({
          status: 'error',
          message: 'Start and end dates are required',
        });
        return;
      }

      const report = await this.paymentsService.generateReport(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      
      res.json({
        status: 'success',
        data: report,
      });
    } catch (error: any) {
      logger.error('Error generating report:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to generate report',
      });
    }
  };
}

export const paymentsController = new PaymentsController();
