import { PrismaClient, Staff, CommissionType } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateStaffDTO {
  userId: string;
  specialties: string[];
  commissionType?: CommissionType;
  commissionValue?: number;
  workSchedule?: any;
  blockedDates?: any;
}

interface UpdateStaffDTO {
  specialties?: string[];
  commissionType?: CommissionType;
  commissionValue?: number;
  workSchedule?: any;
  blockedDates?: any;
  isAvailable?: boolean;
}

interface StaffFilters {
  isAvailable?: boolean;
  specialty?: string;
}

export class StaffService {
  /**
   * Criar um novo profissional
   */
  async create(data: CreateStaffDTO): Promise<Staff> {
    // Verifica se o usuário já tem perfil de staff
    const existingStaff = await prisma.staff.findUnique({
      where: { userId: data.userId },
    });

    if (existingStaff) {
      throw new Error('User already has a staff profile');
    }

    return await prisma.staff.create({
      data: {
        userId: data.userId,
        specialties: data.specialties,
        commissionType: data.commissionType || CommissionType.PERCENT,
        commissionValue: data.commissionValue || 0,
        workSchedule: data.workSchedule || {},
        blockedDates: data.blockedDates || [],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
      },
    });
  }

  /**
   * Listar profissionais com filtros
   */
  async list(filters: StaffFilters = {}): Promise<Staff[]> {
    const where: any = {};
    
    if (filters.isAvailable !== undefined) {
      where.isAvailable = filters.isAvailable;
    }
    
    if (filters.specialty) {
      where.specialties = {
        has: filters.specialty,
      };
    }

    return await prisma.staff.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            appointments: true,
            commissions: true,
          },
        },
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    });
  }

  /**
   * Buscar profissional por ID
   */
  async getById(id: string): Promise<Staff | null> {
    return await prisma.staff.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            appointments: true,
            commissions: true,
          },
        },
      },
    });
  }

  /**
   * Atualizar profissional
   */
  async update(id: string, data: UpdateStaffDTO): Promise<Staff> {
    return await prisma.staff.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
      },
    });
  }

  /**
   * Deletar profissional
   */
  async delete(id: string): Promise<Staff> {
    return await prisma.staff.update({
      where: { id },
      data: { isAvailable: false },
      include: {
        user: true,
      },
    });
  }

  /**
   * Verificar disponibilidade do profissional em uma data
   */
  async checkAvailability(staffId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Buscar agendamentos do dia
    const appointments = await prisma.appointment.findMany({
      where: {
        staffId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          notIn: ['CANCELLED', 'NO_SHOW'],
        },
      },
      orderBy: {
        startTime: 'asc',
      },
      select: {
        startTime: true,
        endTime: true,
        status: true,
      },
    });

    // Buscar horário de trabalho do profissional
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      select: {
        workSchedule: true,
        blockedDates: true,
      },
    });

    return {
      date: date.toISOString().split('T')[0],
      appointments,
      workSchedule: staff?.workSchedule,
      blockedDates: staff?.blockedDates,
    };
  }

  /**
   * Obter horário de trabalho do profissional
   */
  async getSchedule(staffId: string) {
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      select: {
        workSchedule: true,
        blockedDates: true,
      },
    });

    return staff;
  }

  /**
   * Atribuir role a um usuário staff
   */
  async assignRole(staffId: string, roleId: string) {
    // Verificar se o staff existe
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      include: { user: true },
    });

    if (!staff) {
      throw new Error('Staff not found');
    }

    // Verificar se a role existe
    const role: any = await (prisma as any).role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new Error('Role not found');
    }

    // Atualizar a role do usuário
    await prisma.user.update({
      where: { id: staff.userId },
      data: { roleId } as any,
    });

    return {
      message: 'Role assigned successfully',
      staff: {
        id: staff.id,
        userId: staff.userId,
        userName: staff.user.name,
        roleName: role.name,
      },
    };
  }
}
