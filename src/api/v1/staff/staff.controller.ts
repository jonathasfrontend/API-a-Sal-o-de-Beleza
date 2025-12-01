import { Request, Response } from 'express';
import { StaffService } from './staff.service';
import { logger } from '../../../utils/logger';

export class StaffController {
  private staffService: StaffService;

  constructor() {
    this.staffService = new StaffService();
  }

  /**
   * Criar um novo profissional
   * POST /api/v1/staff
   */
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const staff = await this.staffService.create(req.body);
      
      logger.info(`Staff created: ${staff.id}`);
      
      res.status(201).json({
        status: 'success',
        data: { staff },
      });
    } catch (error: any) {
      logger.error('Error creating staff:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to create staff',
      });
    }
  };

  /**
   * Listar todos os profissionais
   * GET /api/v1/staff
   */
  list = async (req: Request, res: Response): Promise<void> => {
    try {
      const { isAvailable, specialty } = req.query;
      
      const filters: any = {};
      if (isAvailable !== undefined) filters.isAvailable = isAvailable === 'true';
      if (specialty) filters.specialty = specialty as string;

      const staff = await this.staffService.list(filters);
      
      res.json({
        status: 'success',
        data: staff,
      });
    } catch (error: any) {
      logger.error('Error listing staff:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to list staff',
      });
    }
  };

  /**
   * Buscar profissional por ID
   * GET /api/v1/staff/:id
   */
  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const staff = await this.staffService.getById(id);
      
      if (!staff) {
        res.status(404).json({
          status: 'error',
          message: 'Staff not found',
        });
        return;
      }

      res.json({
        status: 'success',
        data: { staff },
      });
    } catch (error: any) {
      logger.error('Error getting staff:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to get staff',
      });
    }
  };

  /**
   * Atualizar profissional
   * PUT /api/v1/staff/:id
   */
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const staff = await this.staffService.update(id, req.body);
      
      logger.info(`Staff updated: ${id}`);
      
      res.json({
        status: 'success',
        data: { staff },
      });
    } catch (error: any) {
      logger.error('Error updating staff:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to update staff',
      });
    }
  };

  /**
   * Deletar profissional
   * DELETE /api/v1/staff/:id
   */
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.staffService.delete(id);
      
      logger.info(`Staff deleted: ${id}`);
      
      res.json({
        status: 'success',
        message: 'Staff deleted successfully',
      });
    } catch (error: any) {
      logger.error('Error deleting staff:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to delete staff',
      });
    }
  };

  /**
   * Verificar disponibilidade do profissional
   * GET /api/v1/staff/:id/availability
   */
  checkAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { date } = req.query;
      
      if (!date) {
        res.status(400).json({
          status: 'error',
          message: 'Date parameter is required',
        });
        return;
      }

      const availability = await this.staffService.checkAvailability(id, new Date(date as string));
      
      res.json({
        status: 'success',
        data: availability,
      });
    } catch (error: any) {
      logger.error('Error checking availability:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to check availability',
      });
    }
  };

  /**
   * Obter horário de trabalho do profissional
   * GET /api/v1/staff/:id/schedule
   */
  getSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const schedule = await this.staffService.getSchedule(id);
      
      res.json({
        status: 'success',
        data: { schedule },
      });
    } catch (error: any) {
      logger.error('Error getting schedule:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to get schedule',
      });
    }
  };
}

export const staffController = new StaffController();
