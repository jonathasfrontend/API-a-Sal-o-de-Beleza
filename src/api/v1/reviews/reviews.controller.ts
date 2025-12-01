import { Request, Response } from 'express';
import { ReviewsService } from './reviews.service';
import { logger } from '../../../utils/logger';

export class ReviewsController {
  private reviewsService: ReviewsService;

  constructor() {
    this.reviewsService = new ReviewsService();
  }

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const review = await this.reviewsService.create(req.body);
      logger.info(`Review created: ${review.id}`);
      res.status(201).json({ status: 'success', data: { review } });
    } catch (error: any) {
      logger.error('Error creating review:', error);
      res.status(400).json({ status: 'error', message: error.message });
    }
  };

  list = async (req: Request, res: Response): Promise<void> => {
    try {
      const { clientId } = req.query;
      const reviews = await this.reviewsService.list(clientId as string);
      res.json({ status: 'success', data: reviews });
    } catch (error: any) {
      logger.error('Error listing reviews:', error);
      res.status(400).json({ status: 'error', message: error.message });
    }
  };

  getStats = async (_req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.reviewsService.getStats();
      res.json({ status: 'success', data: stats });
    } catch (error: any) {
      logger.error('Error getting stats:', error);
      res.status(400).json({ status: 'error', message: error.message });
    }
  };
}

export const reviewsController = new ReviewsController();
