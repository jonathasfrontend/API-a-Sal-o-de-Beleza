import { Request, Response } from 'express';
import { ServicesService } from './services.service';
import { logger } from '../../../utils/logger';

export class ServicesController {
  private servicesService: ServicesService;

  constructor() {
    this.servicesService = new ServicesService();
  }

  /**
   * Criar um novo serviço
   * POST /api/v1/services
   */
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const service = await this.servicesService.create(req.body);
      
      logger.info(`Service created: ${service.id}`);
      
      res.status(201).json({
        status: 'success',
        data: { service },
      });
    } catch (error: any) {
      logger.error('Error creating service:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to create service',
      });
    }
  };

  /**
   * Listar todos os serviços
   * GET /api/v1/services
   */
  list = async (req: Request, res: Response): Promise<void> => {
    try {
      const { category, isActive } = req.query;
      
      const filters: any = {};
      if (category) filters.category = category as string;
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const services = await this.servicesService.list(filters);
      
      res.json({
        status: 'success',
        data: services,
      });
    } catch (error: any) {
      logger.error('Error listing services:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to list services',
      });
    }
  };

  /**
   * Buscar serviço por ID
   * GET /api/v1/services/:id
   */
  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const service = await this.servicesService.getById(id);
      
      if (!service) {
        res.status(404).json({
          status: 'error',
          message: 'Service not found',
        });
        return;
      }

      res.json({
        status: 'success',
        data: { service },
      });
    } catch (error: any) {
      logger.error('Error getting service:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to get service',
      });
    }
  };

  /**
   * Atualizar serviço
   * PUT /api/v1/services/:id
   */
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const service = await this.servicesService.update(id, req.body);
      
      logger.info(`Service updated: ${id}`);
      
      res.json({
        status: 'success',
        data: { service },
      });
    } catch (error: any) {
      logger.error('Error updating service:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to update service',
      });
    }
  };

  /**
   * Deletar serviço (soft delete)
   * DELETE /api/v1/services/:id
   */
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.servicesService.delete(id);
      
      logger.info(`Service deleted: ${id}`);
      
      res.json({
        status: 'success',
        message: 'Service deleted successfully',
      });
    } catch (error: any) {
      logger.error('Error deleting service:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to delete service',
      });
    }
  };

  /**
   * Listar categorias de serviços
   * GET /api/v1/services/categories
   */
  listCategories = async (_req: Request, res: Response): Promise<void> => {
    try {
      const categories = await this.servicesService.listCategories();
      
      res.json({
        status: 'success',
        data: categories,
      });
    } catch (error: any) {
      logger.error('Error listing categories:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to list categories',
      });
    }
  };
}

export const servicesController = new ServicesController();
