import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate, checkPermission } from '../../../middlewares/auth.jwt';
import { validateZod } from '../../../middlewares/validate';
import { z } from 'zod';

const router = Router();
const usersController = new UsersController();

// Schemas de validação
const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
  roleId: z.string().uuid('Invalid role ID').optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
  roleId: z.string().uuid('Invalid role ID').optional(),
  isActive: z.boolean().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

/**
 * @route   POST /api/v1/users
 * @desc    Criar um novo usuário
 * @access  Private (Admin, Gerente) - users.create
 */
router.post(
  '/',
  authenticate,
  checkPermission('users.create'),
  validateZod(createUserSchema),
  usersController.create
);

/**
 * @route   GET /api/v1/users
 * @desc    Listar todos os usuários
 * @access  Private (Admin, Gerente) - users.list
 * @query   ?isActive=true&roleId=uuid&search=nome
 */
router.get(
  '/',
  authenticate,
  checkPermission('users.list'),
  usersController.list
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Buscar usuário por ID
 * @access  Private (Admin, Gerente) - users.read
 */
router.get(
  '/:id',
  authenticate,
  checkPermission('users.read'),
  usersController.getById
);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Atualizar dados do usuário
 * @access  Private (Admin, Gerente) - users.update
 */
router.put(
  '/:id',
  authenticate,
  checkPermission('users.update'),
  validateZod(updateUserSchema),
  usersController.update
);

/**
 * @route   PUT /api/v1/users/:id/password
 * @desc    Alterar senha do usuário
 * @access  Private (Admin, Gerente ou o próprio usuário) - users.update
 */
router.put(
  '/:id/password',
  authenticate,
  checkPermission('users.update'),
  validateZod(changePasswordSchema),
  usersController.changePassword
);

/**
 * @route   PUT /api/v1/users/:id/deactivate
 * @desc    Desativar usuário (soft delete)
 * @access  Private (Admin) - users.update
 */
router.put(
  '/:id/deactivate',
  authenticate,
  checkPermission('users.update'),
  usersController.deactivate
);

/**
 * @route   PUT /api/v1/users/:id/activate
 * @desc    Ativar usuário
 * @access  Private (Admin) - users.update
 */
router.put(
  '/:id/activate',
  authenticate,
  checkPermission('users.update'),
  usersController.activate
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Deletar usuário permanentemente
 * @access  Private (Admin) - users.delete
 */
router.delete(
  '/:id',
  authenticate,
  checkPermission('users.delete'),
  usersController.delete
);

export default router;
