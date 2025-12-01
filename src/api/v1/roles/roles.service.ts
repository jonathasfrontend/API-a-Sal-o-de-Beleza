import prisma from '../../../config/db';
import { AppError } from '../../../middlewares/error.handler';

// @ts-ignore - Usando any para contornar problemas de tipos do Prisma
const db = prisma as any;

interface CreateRoleDTO {
  name: string;
  description?: string;
  permissionIds: string[];
}

interface UpdateRoleDTO {
  name?: string;
  description?: string;
  isActive?: boolean;
}

interface AssignPermissionsDTO {
  permissionIds: string[];
}

export class RolesService {
  /**
   * Listar todos os cargos
   */
  async list() {
    return await db.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Buscar cargo por ID
   */
  async getById(id: string) {
    const role = await db.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!role) {
      throw new AppError('Cargo não encontrado', 404);
    }

    return role;
  }

  /**
   * Criar um novo cargo
   * Apenas admin pode criar cargos
   */
  async create(data: CreateRoleDTO) {
    const { name, description, permissionIds } = data;

    // Verificar se já existe um cargo com esse nome
    const existingRole = await db.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      throw new AppError('Já existe um cargo com este nome', 400);
    }

    // Verificar se todas as permissões existem
    const permissions = await db.permission.findMany({
      where: {
        id: {
          in: permissionIds,
        },
      },
    });

    if (permissions.length !== permissionIds.length) {
      throw new AppError('Uma ou mais permissões não foram encontradas', 400);
    }

    // Criar o cargo
    const role = await db.role.create({
      data: {
        name,
        description,
        isSystem: false,
      },
    });

    // Atribuir permissões ao cargo
    if (permissionIds.length > 0) {
      await db.rolePermission.createMany({
        data: permissionIds.map(permissionId => ({
          roleId: role.id,
          permissionId,
        })),
      });
    }

    // Retornar o cargo criado com as permissões
    return await this.getById(role.id);
  }

  /**
   * Atualizar um cargo
   * Apenas admin pode atualizar cargos
   */
  async update(id: string, data: UpdateRoleDTO) {
    const role = await db.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new AppError('Cargo não encontrado', 404);
    }

    // Não permitir editar cargos de sistema
    if (role.isSystem) {
      throw new AppError('Cargos de sistema não podem ser editados', 403);
    }

    // Se estiver alterando o nome, verificar se já existe outro cargo com esse nome
    if (data.name && data.name !== role.name) {
      const existingRole = await db.role.findUnique({
        where: { name: data.name },
      });

      if (existingRole) {
        throw new AppError('Já existe um cargo com este nome', 400);
      }
    }

    await db.role.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
      },
    });

    return await this.getById(id);
  }

  /**
   * Deletar um cargo
   * Apenas admin pode deletar cargos
   */
  async delete(id: string) {
    const role = await db.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!role) {
      throw new AppError('Cargo não encontrado', 404);
    }

    // Não permitir deletar cargos de sistema
    if (role.isSystem) {
      throw new AppError('Cargos de sistema não podem ser deletados', 403);
    }

    // Não permitir deletar cargo com usuários atribuídos
    if (role._count.users > 0) {
      throw new AppError(
        'Não é possível deletar um cargo que possui usuários atribuídos',
        400
      );
    }

    await db.role.delete({
      where: { id },
    });

    return { message: 'Cargo deletado com sucesso' };
  }

  /**
   * Atribuir permissões a um cargo
   * Apenas admin pode atribuir permissões
   */
  async assignPermissions(roleId: string, data: AssignPermissionsDTO) {
    const role = await db.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new AppError('Cargo não encontrado', 404);
    }

    // Verificar se todas as permissões existem
    const permissions = await db.permission.findMany({
      where: {
        id: {
          in: data.permissionIds,
        },
      },
    });

    if (permissions.length !== data.permissionIds.length) {
      throw new AppError('Uma ou mais permissões não foram encontradas', 400);
    }

    // Remover todas as permissões atuais do cargo
    await db.rolePermission.deleteMany({
      where: { roleId },
    });

    // Adicionar as novas permissões
    if (data.permissionIds.length > 0) {
      await db.rolePermission.createMany({
        data: data.permissionIds.map(permissionId => ({
          roleId,
          permissionId,
        })),
      });
    }

    return await this.getById(roleId);
  }

  /**
   * Atribuir cargo a um usuário
   * Apenas admin pode atribuir cargos
   */
  async assignRoleToUser(userId: string, roleId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const role = await db.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new AppError('Cargo não encontrado', 404);
    }

    if (!role.isActive) {
      throw new AppError('Este cargo está inativo', 400);
    }

    await db.user.update({
      where: { id: userId },
      data: { roleId },
    });

    return {
      message: 'Cargo atribuído com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: role.name,
      },
    };
  }

  /**
   * Listar todas as permissões disponíveis
   */
  async listPermissions() {
    return await db.permission.findMany({
      orderBy: [
        { module: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  /**
   * Obter permissões de um cargo específico
   */
  async getRolePermissions(roleId: string) {
    const role = await db.role.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new AppError('Cargo não encontrado', 404);
    }

    return role.rolePermissions.map((rp: any) => rp.permission);
  }
}
