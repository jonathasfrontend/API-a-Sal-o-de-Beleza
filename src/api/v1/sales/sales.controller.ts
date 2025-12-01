import { Request, Response } from 'express';
import { SalesService } from './sales.service';
import { logger } from '../../../utils/logger';

export class SalesController {
  private salesService: SalesService;

  constructor() {
    this.salesService = new SalesService();
  }

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const sale = await this.salesService.create(req.body);
      logger.info(`Sale created: ${sale.id}`);
      res.status(201).json({ status: 'success', data: { sale } });
    } catch (error: any) {
      logger.error('Error creating sale:', error);
      res.status(400).json({ status: 'error', message: error.message || 'Failed to create sale' });
    }
  };

  list = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate, clientId } = req.query;
      const filters: any = {};
      if (clientId) filters.clientId = clientId as string;
      if (startDate || endDate) {
        filters.dateRange = {
          start: startDate ? new Date(startDate as string) : undefined,
          end: endDate ? new Date(endDate as string) : undefined,
        };
      }
      const sales = await this.salesService.list(filters);
      res.json({ status: 'success', data: sales });
    } catch (error: any) {
      logger.error('Error listing sales:', error);
      res.status(400).json({ status: 'error', message: error.message || 'Failed to list sales' });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const sale = await this.salesService.getById(id);
      if (!sale) {
        res.status(404).json({ status: 'error', message: 'Sale not found' });
        return;
      }
      res.json({ status: 'success', data: { sale } });
    } catch (error: any) {
      logger.error('Error getting sale:', error);
      res.status(400).json({ status: 'error', message: error.message || 'Failed to get sale' });
    }
  };
}

export const salesController = new SalesController();
