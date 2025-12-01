import { Request, Response } from 'express';
import { RolesService } from './roles.service';
import { logger } from '../../../utils/logger';

export class RolesController {
  private rolesService: RolesService;

  constructor() {
    this.rolesService = new RolesService();
  }

  /**
   * Listar todos os cargos
   * GET /api/v1/roles
   */
  list = async (_req: Request, res: Response): Promise<void> => {
    try {
      const roles = await this.rolesService.list();

      res.json({
        status: 'success',
        data: roles,
      });
    } catch (error: any) {
      logger.error('Error listing roles:', error);
      res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message || 'Failed to list roles',
      });
    }
  };

  /**
   * Buscar cargo por ID
   * GET /api/v1/roles/:id
   */
  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const role = await this.rolesService.getById(id);

      res.json({
        status: 'success',
        data: role,
      });
    } catch (error: any) {
      logger.error('Error getting role:', error);
      res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message || 'Failed to get role',
      });
    }
  };

  /**
   * Criar um novo cargo
   * POST /api/v1/roles
   */
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const role = await this.rolesService.create(req.body);

      logger.info(`Role created: ${role.id} by user ${req.user?.id}`);

      res.status(201).json({
        status: 'success',
        data: role,
      });
    } catch (error: any) {
      logger.error('Error creating role:', error);
      res.status(error.statusCode || 400).json({
        status: 'error',
        message: error.message || 'Failed to create role',
      });
    }
  };

  /**
   * Atualizar um cargo
   * PUT /api/v1/roles/:id
   */
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const role = await this.rolesService.update(id, req.body);

      logger.info(`Role updated: ${id} by user ${req.user?.id}`);

      res.json({
        status: 'success',
        data: role,
      });
    } catch (error: any) {
      logger.error('Error updating role:', error);
      res.status(error.statusCode || 400).json({
        status: 'error',
        message: error.message || 'Failed to update role',
      });
    }
  };

  /**
   * Deletar um cargo
   * DELETE /api/v1/roles/:id
   */
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.rolesService.delete(id);

      logger.info(`Role deleted: ${id} by user ${req.user?.id}`);

      res.json({
        status: 'success',
        data: result,
      });
    } catch (error: any) {
      logger.error('Error deleting role:', error);
      res.status(error.statusCode || 400).json({
        status: 'error',
        message: error.message || 'Failed to delete role',
      });
    }
  };

  /**
   * Atribuir permissões a um cargo
   * PUT /api/v1/roles/:id/permissions
   */
  assignPermissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const role = await this.rolesService.assignPermissions(id, req.body);

      logger.info(`Permissions assigned to role: ${id} by user ${req.user?.id}`);

      res.json({
        status: 'success',
        data: role,
      });
    } catch (error: any) {
      logger.error('Error assigning permissions:', error);
      res.status(error.statusCode || 400).json({
        status: 'error',
        message: error.message || 'Failed to assign permissions',
      });
    }
  };

  /**
   * Atribuir cargo a um usuário
   * POST /api/v1/roles/:roleId/assign/:userId
   */
  assignRoleToUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { roleId, userId } = req.params;
      const result = await this.rolesService.assignRoleToUser(userId, roleId);

      logger.info(`Role ${roleId} assigned to user ${userId} by user ${req.user?.id}`);

      res.json({
        status: 'success',
        data: result,
      });
    } catch (error: any) {
      logger.error('Error assigning role to user:', error);
      res.status(error.statusCode || 400).json({
        status: 'error',
        message: error.message || 'Failed to assign role to user',
      });
    }
  };

  /**
   * Listar todas as permissões disponíveis
   * GET /api/v1/roles/permissions
   */
  listPermissions = async (_req: Request, res: Response): Promise<void> => {
    try {
      const permissions = await this.rolesService.listPermissions();

      res.json({
        status: 'success',
        data: permissions,
      });
    } catch (error: any) {
      logger.error('Error listing permissions:', error);
      res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message || 'Failed to list permissions',
      });
    }
  };

  /**
   * Obter permissões de um cargo específico
   * GET /api/v1/roles/:id/permissions
   */
  getRolePermissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const permissions = await this.rolesService.getRolePermissions(id);

      res.json({
        status: 'success',
        data: permissions,
      });
    } catch (error: any) {
      logger.error('Error getting role permissions:', error);
      res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message || 'Failed to get role permissions',
      });
    }
  };
}
