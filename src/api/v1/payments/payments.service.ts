import { PrismaClient, Payment, PaymentStatus, PaymentMethod } from '@prisma/client';

const prisma = new PrismaClient();

interface CreatePaymentDTO {
  appointmentId?: string;
  clientId: string;
  amount: number;
  method: PaymentMethod;
  gatewayReference?: string;
}

interface PaymentFilters {
  status?: string;
  method?: string;
  clientId?: string;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
}

export class PaymentsService {
  /**
   * Criar um novo pagamento
   */
  async create(data: CreatePaymentDTO): Promise<Payment> {
    const payment = await prisma.payment.create({
      data: {
        appointmentId: data.appointmentId,
        clientId: data.clientId,
        amount: data.amount,
        method: data.method,
        gatewayReference: data.gatewayReference,
        status: PaymentStatus.PENDING,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        appointment: {
          select: {
            id: true,
            startTime: true,
            services: true,
          },
        },
      },
    });

    return payment;
  }

  /**
   * Listar pagamentos com filtros
   */
  async list(filters: PaymentFilters = {}): Promise<Payment[]> {
    const where: any = {};
    
    if (filters.status) {
      where.status = filters.status as PaymentStatus;
    }
    
    if (filters.method) {
      where.method = filters.method as PaymentMethod;
    }
    
    if (filters.clientId) {
      where.clientId = filters.clientId;
    }
    
    if (filters.dateRange) {
      where.createdAt = {};
      if (filters.dateRange.start) {
        where.createdAt.gte = filters.dateRange.start;
      }
      if (filters.dateRange.end) {
        where.createdAt.lte = filters.dateRange.end;
      }
    }

    return await prisma.payment.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        appointment: {
          select: {
            id: true,
            startTime: true,
            services: true,
          },
        },
        commissions: {
          include: {
            staff: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Buscar pagamento por ID
   */
  async getById(id: string): Promise<Payment | null> {
    return await prisma.payment.findUnique({
      where: { id },
      include: {
        client: true,
        appointment: true,
        commissions: {
          include: {
            staff: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Confirmar pagamento
   */
  async confirm(id: string): Promise<Payment> {
    const payment = await prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.PAID,
        paidAt: new Date(),
      },
      include: {
        appointment: true,
      },
    });

    // Atualizar agendamento como pago
    if (payment.appointmentId) {
      await prisma.appointment.update({
        where: { id: payment.appointmentId },
        data: { isPaid: true },
      });

      // Criar comissões para o profissional
      const appointment = await prisma.appointment.findUnique({
        where: { id: payment.appointmentId },
        include: {
          staff: true,
        },
      });

      if (appointment) {
        const commissionAmount = this.calculateCommission(
          payment.amount,
          appointment.staff.commissionType,
          appointment.staff.commissionValue
        );

        await prisma.commission.create({
          data: {
            paymentId: payment.id,
            staffId: appointment.staffId,
            amount: commissionAmount,
          },
        });
      }
    }

    return payment;
  }

  /**
   * Reembolsar pagamento
   */
  async refund(id: string): Promise<Payment> {
    const payment = await prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.REFUNDED,
      },
    });

    // Atualizar agendamento
    if (payment.appointmentId) {
      await prisma.appointment.update({
        where: { id: payment.appointmentId },
        data: { isPaid: false },
      });
    }

    // Marcar comissões como não pagas
    await prisma.commission.updateMany({
      where: { paymentId: id },
      data: { isPaid: false },
    });

    return payment;
  }

  /**
   * Gerar relatório de pagamentos
   */
  async generateReport(startDate: Date, endDate: Date) {
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const paid = payments.filter(p => p.status === PaymentStatus.PAID);
    const pending = payments.filter(p => p.status === PaymentStatus.PENDING);
    const refunded = payments.filter(p => p.status === PaymentStatus.REFUNDED);

    const byMethod = await prisma.payment.groupBy({
      by: ['method'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: PaymentStatus.PAID,
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    return {
      period: {
        start: startDate,
        end: endDate,
      },
      summary: {
        total: total,
        totalPaid: paid.reduce((sum, p) => sum + p.amount, 0),
        totalPending: pending.reduce((sum, p) => sum + p.amount, 0),
        totalRefunded: refunded.reduce((sum, p) => sum + p.amount, 0),
        count: payments.length,
        countPaid: paid.length,
        countPending: pending.length,
        countRefunded: refunded.length,
      },
      byMethod: byMethod.map(m => ({
        method: m.method,
        total: m._sum.amount || 0,
        count: m._count,
      })),
    };
  }

  /**
   * Calcular comissão do profissional
   */
  private calculateCommission(amount: number, type: string, value: number): number {
    switch (type) {
      case 'PERCENT':
        return (amount * value) / 100;
      case 'FIXED':
        return value;
      case 'TABLE':
        // Implementar lógica de tabela se necessário
        return 0;
      default:
        return 0;
    }
  }
}
