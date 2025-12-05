import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { AppError } from '../../../middlewares/error.handler';

const prisma = new PrismaClient();

interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
  phone?: string;
  avatar?: string;
  roleId?: string;
}

interface UpdateUserDTO {
  name?: string;
  phone?: string;
  avatar?: string;
  roleId?: string;
  isActive?: boolean;
}

interface UserFilters {
  isActive?: boolean;
  roleId?: string;
  search?: string;
}

export class UsersService {
  /**
   * Criar um novo usuário
   */
  async create(data: CreateUserDTO): Promise<Omit<User, 'passwordHash'>> {
    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.name,
        phone: data.phone,
        avatar: data.avatar,
        roleId: data.roleId,
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    // Remover passwordHash do retorno
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword as any;
  }

  /**
   * Listar usuários com filtros
   */
  async list(filters: UserFilters = {}): Promise<Omit<User, 'passwordHash'>[]> {
    const where: any = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.roleId) {
      where.roleId = filters.roleId;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        staff: {
          select: {
            id: true,
            specialties: true,
            isAvailable: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Remover passwordHash de todos os usuários
    return users.map(({ passwordHash, ...user }) => user) as any;
  }

  /**
   * Buscar usuário por ID
   */
  async getById(id: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        staff: {
          select: {
            id: true,
            specialties: true,
            commissionType: true,
            commissionValue: true,
            workSchedule: true,
            isAvailable: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    // Remover passwordHash
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword as any;
  }

  /**
   * Atualizar usuário
   */
  async update(id: string, data: UpdateUserDTO): Promise<Omit<User, 'passwordHash'>> {
    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new AppError('User not found', 404);
    }

    // Atualizar usuário
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        avatar: data.avatar,
        roleId: data.roleId,
        isActive: data.isActive,
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        staff: {
          select: {
            id: true,
            specialties: true,
            isAvailable: true,
          },
        },
      },
    });

    // Remover passwordHash
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword as any;
  }

  /**
   * Alterar senha do usuário
   */
  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verificar senha atual
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Hash da nova senha
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Atualizar senha
    await prisma.user.update({
      where: { id },
      data: {
        passwordHash: newPasswordHash,
      },
    });
  }

  /**
   * Desativar usuário (soft delete)
   */
  async deactivate(id: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  /**
   * Ativar usuário
   */
  async activate(id: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    await prisma.user.update({
      where: { id },
      data: {
        isActive: true,
      },
    });
  }

  /**
   * Deletar usuário permanentemente
   */
  async delete(id: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    await prisma.user.delete({
      where: { id },
    });
  }
}
