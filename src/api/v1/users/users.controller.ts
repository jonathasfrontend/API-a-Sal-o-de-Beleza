import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { logger } from '../../../utils/logger';

export class UsersController {
  private usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();
  }

  /**
   * Criar um novo usuário
   * POST /api/v1/users
   */
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.usersService.create(req.body);

      logger.info(`User created: ${user.id} - ${user.email}`);

      res.status(201).json({
        status: 'success',
        data: { user },
      });
    } catch (error: any) {
      logger.error('Error creating user:', error);
      res.status(error.statusCode || 400).json({
        status: 'error',
        message: error.message || 'Failed to create user',
      });
    }
  };

  /**
   * Listar todos os usuários
   * GET /api/v1/users
   */
  list = async (req: Request, res: Response): Promise<void> => {
    try {
      const { isActive, roleId, search } = req.query;

      const filters: any = {};
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (roleId) filters.roleId = roleId as string;
      if (search) filters.search = search as string;

      const users = await this.usersService.list(filters);

      res.json({
        status: 'success',
        data: {
          users,
          total: users.length,
        },
      });
    } catch (error: any) {
      logger.error('Error listing users:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to list users',
      });
    }
  };

  /**
   * Buscar usuário por ID
   * GET /api/v1/users/:id
   */
  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.usersService.getById(id);

      if (!user) {
        res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
        return;
      }

      res.json({
        status: 'success',
        data: { user },
      });
    } catch (error: any) {
      logger.error('Error getting user:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to get user',
      });
    }
  };

  /**
   * Atualizar usuário
   * PUT /api/v1/users/:id
   */
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.usersService.update(id, req.body);

      logger.info(`User updated: ${user.id}`);

      res.json({
        status: 'success',
        data: { user },
      });
    } catch (error: any) {
      logger.error('Error updating user:', error);
      res.status(error.statusCode || 400).json({
        status: 'error',
        message: error.message || 'Failed to update user',
      });
    }
  };

  /**
   * Alterar senha do usuário
   * PUT /api/v1/users/:id/password
   */
  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;

      await this.usersService.changePassword(id, currentPassword, newPassword);

      logger.info(`Password changed for user: ${id}`);

      res.json({
        status: 'success',
        message: 'Password changed successfully',
      });
    } catch (error: any) {
      logger.error('Error changing password:', error);
      res.status(error.statusCode || 400).json({
        status: 'error',
        message: error.message || 'Failed to change password',
      });
    }
  };

  /**
   * Desativar usuário
   * PUT /api/v1/users/:id/deactivate
   */
  deactivate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.usersService.deactivate(id);

      logger.info(`User deactivated: ${id}`);

      res.json({
        status: 'success',
        message: 'User deactivated successfully',
      });
    } catch (error: any) {
      logger.error('Error deactivating user:', error);
      res.status(error.statusCode || 400).json({
        status: 'error',
        message: error.message || 'Failed to deactivate user',
      });
    }
  };

  /**
   * Ativar usuário
   * PUT /api/v1/users/:id/activate
   */
  activate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.usersService.activate(id);

      logger.info(`User activated: ${id}`);

      res.json({
        status: 'success',
        message: 'User activated successfully',
      });
    } catch (error: any) {
      logger.error('Error activating user:', error);
      res.status(error.statusCode || 400).json({
        status: 'error',
        message: error.message || 'Failed to activate user',
      });
    }
  };

  /**
   * Deletar usuário permanentemente
   * DELETE /api/v1/users/:id
   */
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.usersService.delete(id);

      logger.info(`User deleted: ${id}`);

      res.json({
        status: 'success',
        message: 'User deleted successfully',
      });
    } catch (error: any) {
      logger.error('Error deleting user:', error);
      res.status(error.statusCode || 400).json({
        status: 'error',
        message: error.message || 'Failed to delete user',
      });
    }
  };
}
