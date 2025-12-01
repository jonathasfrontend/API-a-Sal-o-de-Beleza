import { Request, Response } from 'express';
import { ReportsService } from './reports.service';
import { logger } from '../../../utils/logger';

export class ReportsController {
  private reportsService: ReportsService;

  constructor() {
    this.reportsService = new ReportsService();
  }

  dashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;
      const report = await this.reportsService.getDashboard(
        startDate ? new Date(startDate as string) : new Date(new Date().setDate(1)),
        endDate ? new Date(endDate as string) : new Date()
      );
      res.json({ status: 'success', data: report });
    } catch (error: any) {
      logger.error('Error generating dashboard:', error);
      res.status(400).json({ status: 'error', message: error.message });
    }
  };

  financial = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        res.status(400).json({ status: 'error', message: 'Start and end dates are required' });
        return;
      }
      const report = await this.reportsService.getFinancial(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json({ status: 'success', data: report });
    } catch (error: any) {
      logger.error('Error generating financial report:', error);
      res.status(400).json({ status: 'error', message: error.message });
    }
  };

  commissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { staffId, startDate, endDate } = req.query;
      const report = await this.reportsService.getCommissions(
        staffId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json({ status: 'success', data: report });
    } catch (error: any) {
      logger.error('Error generating commissions report:', error);
      res.status(400).json({ status: 'error', message: error.message });
    }
  };
}

export const reportsController = new ReportsController();
