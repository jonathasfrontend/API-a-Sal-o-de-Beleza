import { Router } from 'express';
import { RolesController } from './roles.controller';
import { authenticate, checkPermission } from '../../../middlewares/auth.jwt';
import { validateJoi } from '../../../middlewares/validate';
import Joi from 'joi';

const router = Router();
const rolesController = new RolesController();

// Validações
const createRoleSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  description: Joi.string().optional().allow(''),
  permissionIds: Joi.array().items(Joi.string().uuid()).required().min(1),
});

const updateRoleSchema = Joi.object({
  name: Joi.string().optional().min(2).max(100),
  description: Joi.string().optional().allow(''),
  isActive: Joi.boolean().optional(),
});

const assignPermissionsSchema = Joi.object({
  permissionIds: Joi.array().items(Joi.string().uuid()).required(),
});

// Todas as rotas de roles requerem autenticação
router.use(authenticate);

/**
 * @route   GET /api/v1/roles/permissions
 * @desc    Listar todas as permissões disponíveis
 * @access  Admin
 */
router.get(
  '/permissions',
  checkPermission('roles.read'),
  rolesController.listPermissions
);

/**
 * @route   GET /api/v1/roles
 * @desc    Listar todos os cargos
 * @access  Admin
 */
router.get(
  '/',
  checkPermission('roles.read'),
  rolesController.list
);

/**
 * @route   GET /api/v1/roles/:id
 * @desc    Buscar cargo por ID
 * @access  Admin
 */
router.get(
  '/:id',
  checkPermission('roles.read'),
  rolesController.getById
);

/**
 * @route   GET /api/v1/roles/:id/permissions
 * @desc    Obter permissões de um cargo específico
 * @access  Admin
 */
router.get(
  '/:id/permissions',
  checkPermission('roles.read'),
  rolesController.getRolePermissions
);

/**
 * @route   POST /api/v1/roles
 * @desc    Criar um novo cargo
 * @access  Admin only
 */
router.post(
  '/',
  checkPermission('roles.create'),
  validateJoi(createRoleSchema),
  rolesController.create
);

/**
 * @route   PUT /api/v1/roles/:id
 * @desc    Atualizar um cargo
 * @access  Admin only
 */
router.put(
  '/:id',
  checkPermission('roles.update'),
  validateJoi(updateRoleSchema),
  rolesController.update
);

/**
 * @route   DELETE /api/v1/roles/:id
 * @desc    Deletar um cargo
 * @access  Admin only
 */
router.delete(
  '/:id',
  checkPermission('roles.delete'),
  rolesController.delete
);

/**
 * @route   PUT /api/v1/roles/:id/permissions
 * @desc    Atribuir permissões a um cargo
 * @access  Admin only
 */
router.put(
  '/:id/permissions',
  checkPermission('roles.update'),
  validateJoi(assignPermissionsSchema),
  rolesController.assignPermissions
);

/**
 * @route   POST /api/v1/roles/:roleId/assign/:userId
 * @desc    Atribuir cargo a um usuário
 * @access  Admin only
 */
router.post(
  '/:roleId/assign/:userId',
  checkPermission('roles.assign'),
  rolesController.assignRoleToUser
);

export default router;
