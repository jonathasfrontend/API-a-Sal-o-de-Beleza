import prisma from '../../../config/db';
import { AppError } from '../../../middlewares/error.handler';

type AppointmentWhereInput = {
  staffId?: string;
  clientId?: string;
  status?: any;
  startTime?: {
    gte?: Date;
    lte?: Date;
    lt?: Date;
    gt?: Date;
  };
  OR?: Array<{
    AND?: Array<{
      startTime?: { lte?: Date; lt?: Date; gte?: Date };
      endTime?: { gt?: Date; gte?: Date; lte?: Date };
    }>;
  }>;
  id?: { not?: string };
};

interface CreateAppointmentInput {
  clientId: string;
  staffId: string;
  startTime: Date;
  services: Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
  }>;
  notes?: string;
}

interface UpdateAppointmentInput {
  staffId?: string;
  startTime?: Date;
  status?: string;
  notes?: string;
  isPaid?: boolean;
}

export class AppointmentService {
  async create(data: CreateAppointmentInput, createdBy: string) {
    // Validate client exists
    const client = await prisma.client.findUnique({
      where: { id: data.clientId },
    });

    if (!client) {
      throw new AppError('Client not found', 404);
    }

    if (client.isBlocked) {
      throw new AppError('Client is blocked due to no-shows', 400);
    }

    // Validate staff exists
    const staff = await prisma.staff.findUnique({
      where: { id: data.staffId },
    });

    if (!staff || !staff.isAvailable) {
      throw new AppError('Staff not available', 400);
    }

    // Calculate total duration and amount
    const totalDuration = data.services.reduce((sum, s) => sum + s.duration, 0);
    const totalAmount = data.services.reduce((sum, s) => sum + s.price, 0);

    const endTime = new Date(data.startTime);
    endTime.setMinutes(endTime.getMinutes() + totalDuration);

    // Check for conflicts
    const hasConflict = await this.checkConflict(
      data.staffId,
      data.startTime,
      endTime
    );

    if (hasConflict) {
      throw new AppError('Time slot not available', 400);
    }

    // Create appointment with payment in a transaction
    const appointment = await prisma.$transaction(async (tx : any) => {
      // Create the appointment
      const newAppointment = await tx.appointment.create({
        data: {
          clientId: data.clientId,
          staffId: data.staffId,
          startTime: data.startTime,
          endTime,
          services: data.services,
          totalAmount,
          notes: data.notes,
          createdBy,
        },
      });

      // Create the payment automatically with PENDING status
      await tx.payment.create({
        data: {
          appointmentId: newAppointment.id,
          clientId: data.clientId,
          amount: totalAmount,
          method: 'CASH', // Default method, can be changed later
          status: 'PENDING',
        },
      });

      // Return appointment with relations
      return tx.appointment.findUnique({
        where: { id: newAppointment.id },
        include: {
          client: true,
          staff: {
            include: {
              user: {
                select: { name: true, phone: true },
              },
            },
          },
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });
    });

    return appointment;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    staffId?: string;
    clientId?: string;
    status?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { page = 1, limit = 50, staffId, clientId, status, date, startDate, endDate } = params;
    const skip = (page - 1) * limit;

    const where: AppointmentWhereInput = {};

    if (staffId) {
      where.staffId = staffId;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (status) {
      where.status = status as any;
    }

    // Filter by specific date
    if (date && !startDate && !endDate) {
      // Usar UTC para evitar problemas de timezone
      const dateStr = date.includes('T') ? date.split('T')[0] : date;
      const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
      const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

      where.startTime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }
    // Filter by date range
    else if (startDate && endDate) {
      // Validar formato de data
      const startStr = startDate.includes('T') ? startDate.split('T')[0] : startDate;
      const endStr = endDate.includes('T') ? endDate.split('T')[0] : endDate;
      
      const start = new Date(`${startStr}T00:00:00.000Z`);
      const end = new Date(`${endStr}T23:59:59.999Z`);
      
      // Validar se as datas são válidas
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new AppError('Invalid date format. Use YYYY-MM-DD format', 400);
      }
      
      where.startTime = {
        gte: start,
        lte: end,
      };
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startTime: 'asc' },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          staff: {
            include: {
              user: {
                select: { name: true },
              },
            },
          },
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.appointment.count({ where }),
    ]);

    return {
      data: appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        client: true,
        staff: {
          include: {
            user: {
              select: { name: true, phone: true },
            },
          },
        },
        payments: true,
      },
    });

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    return appointment;
  }

  async update(id: string, data: UpdateAppointmentInput) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    // Check if rescheduling
    if (data.startTime || data.staffId) {
      const staffId = data.staffId || appointment.staffId;
      const startTime = data.startTime || appointment.startTime;
      const duration = (appointment.endTime.getTime() - appointment.startTime.getTime()) / 60000;
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + duration);

      const hasConflict = await this.checkConflict(staffId, startTime, endTime, id);

      if (hasConflict) {
        throw new AppError('Time slot not available', 400);
      }

      // Calculate new end time if start time changed
      if (data.startTime) {
        const duration = (appointment.endTime.getTime() - appointment.startTime.getTime()) / 60000;
        const newEndTime = new Date(startTime);
        newEndTime.setMinutes(newEndTime.getMinutes() + duration);
        
        const updateData: any = { ...data, startTime, endTime: newEndTime };
        
        const updated = await prisma.appointment.update({
          where: { id },
          data: updateData,
          include: {
            client: true,
            staff: {
              include: {
                user: { select: { name: true } },
              },
            },
            payments: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        });
        
        return updated;
      }
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: data as any,
      include: {
        client: true,
        staff: {
          include: {
            user: { select: { name: true } },
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return updated;
  }

  async cancel(id: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { payments: true },
    });

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    // Use transaction to update both appointment and payment
    const result = await prisma.$transaction(async (tx : any) => {
      // Update appointment status
      const updatedAppointment = await tx.appointment.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          client: true,
          staff: {
            include: {
              user: { select: { name: true } },
            },
          },
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      // Cancel pending payments
      if (appointment.payments && appointment.payments.length > 0) {
        await tx.payment.updateMany({
          where: {
            appointmentId: id,
            status: { in: ['PENDING', 'PARTIAL'] },
          },
          data: { status: 'CANCELLED' },
        });
      }

      return updatedAppointment;
    });

    return result;
  }

  async markNoShow(id: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    // Update appointment status
    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: 'NO_SHOW' },
    });

    // Increment client no-show count
    await prisma.client.update({
      where: { id: appointment.clientId },
      data: {
        noShowCount: {
          increment: 1,
        },
      },
    });

    // Auto-block if >= 3 no-shows
    if (appointment.client.noShowCount + 1 >= 3) {
      await prisma.client.update({
        where: { id: appointment.clientId },
        data: { isBlocked: true },
      });
    }

    return updated;
  }

  async checkAvailability(staffId: string, date: string) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

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
      orderBy: { startTime: 'asc' },
    });

    return appointments;
  }

  private async checkConflict(
    staffId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string
  ): Promise<boolean> {
    const where: AppointmentWhereInput = {
      staffId,
      status: {
        notIn: ['CANCELLED', 'NO_SHOW'],
      },
      OR: [
        {
          AND: [
            { startTime: { lte: startTime } },
            { endTime: { gt: startTime } },
          ],
        },
        {
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gte: endTime } },
          ],
        },
        {
          AND: [
            { startTime: { gte: startTime } },
            { endTime: { lte: endTime } },
          ],
        },
      ],
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const conflict = await prisma.appointment.findFirst({ where });

    return !!conflict;
  }

  async getStats(params: { staffId?: string; startDate: string; endDate: string }) {
    const { staffId, startDate, endDate } = params;

    const where: AppointmentWhereInput = {
      startTime: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    if (staffId) {
      where.staffId = staffId;
    }

    const [total, completed, cancelled, noShow, totalRevenue] = await Promise.all([
      prisma.appointment.count({ where }),
      prisma.appointment.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.appointment.count({ where: { ...where, status: 'CANCELLED' } }),
      prisma.appointment.count({ where: { ...where, status: 'NO_SHOW' } }),
      prisma.appointment.aggregate({
        where: { ...where, status: 'COMPLETED', isPaid: true },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      total,
      completed,
      cancelled,
      noShow,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      noShowRate: total > 0 ? (noShow / total) * 100 : 0,
    };
  }
}
