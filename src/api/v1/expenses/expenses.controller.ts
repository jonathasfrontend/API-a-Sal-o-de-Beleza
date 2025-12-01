import { Request, Response } from 'express';
import { ExpensesService } from './expenses.service';
import { logger } from '../../../utils/logger';

export class ExpensesController {
  private expensesService: ExpensesService;

  constructor() {
    this.expensesService = new ExpensesService();
  }

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const expense = await this.expensesService.create(req.body);
      logger.info(`Expense created: ${expense.id}`);
      res.status(201).json({ status: 'success', data: { expense } });
    } catch (error: any) {
      logger.error('Error creating expense:', error);
      res.status(400).json({ status: 'error', message: error.message || 'Failed to create expense' });
    }
  };

  list = async (req: Request, res: Response): Promise<void> => {
    try {
      const { category, isPaid, startDate, endDate } = req.query;
      const filters: any = {};
      if (category) filters.category = category as string;
      if (isPaid !== undefined) filters.isPaid = isPaid === 'true';
      if (startDate || endDate) {
        filters.dateRange = {
          start: startDate ? new Date(startDate as string) : undefined,
          end: endDate ? new Date(endDate as string) : undefined,
        };
      }
      const expenses = await this.expensesService.list(filters);
      res.json({ status: 'success', data: expenses });
    } catch (error: any) {
      logger.error('Error listing expenses:', error);
      res.status(400).json({ status: 'error', message: error.message || 'Failed to list expenses' });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const expense = await this.expensesService.getById(id);
      if (!expense) {
        res.status(404).json({ status: 'error', message: 'Expense not found' });
        return;
      }
      res.json({ status: 'success', data: { expense } });
    } catch (error: any) {
      logger.error('Error getting expense:', error);
      res.status(400).json({ status: 'error', message: error.message || 'Failed to get expense' });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const expense = await this.expensesService.update(id, req.body);
      logger.info(`Expense updated: ${id}`);
      res.json({ status: 'success', data: { expense } });
    } catch (error: any) {
      logger.error('Error updating expense:', error);
      res.status(400).json({ status: 'error', message: error.message || 'Failed to update expense' });
    }
  };

  markAsPaid = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const expense = await this.expensesService.markAsPaid(id);
      logger.info(`Expense marked as paid: ${id}`);
      res.json({ status: 'success', data: { expense } });
    } catch (error: any) {
      logger.error('Error marking expense as paid:', error);
      res.status(400).json({ status: 'error', message: error.message || 'Failed to mark expense as paid' });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.expensesService.delete(id);
      logger.info(`Expense deleted: ${id}`);
      res.json({ status: 'success', message: 'Expense deleted successfully' });
    } catch (error: any) {
      logger.error('Error deleting expense:', error);
      res.status(400).json({ status: 'error', message: error.message || 'Failed to delete expense' });
    }
  };
}

export const expensesController = new ExpensesController();
