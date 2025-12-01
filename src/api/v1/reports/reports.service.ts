import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ReportsService {
  async getDashboard(startDate: Date, endDate: Date) {
    const [appointments, payments, expenses, clients] = await Promise.all([
      prisma.appointment.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      prisma.payment.aggregate({
        where: {
          status: 'PAID',
          createdAt: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.expense.aggregate({
        where: {
          isPaid: true,
          paidDate: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
      prisma.client.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    const revenue = payments._sum.amount || 0;
    const costs = expenses._sum.amount || 0;
    const profit = revenue - costs;

    return {
      period: { start: startDate, end: endDate },
      appointments: { total: appointments },
      revenue: { total: revenue, count: payments._count },
      expenses: { total: costs },
      profit,
      newClients: clients,
    };
  }

  async getFinancial(startDate: Date, endDate: Date) {
    const [payments, expenses, commissions] = await Promise.all([
      prisma.payment.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: 'PAID',
        },
        include: {
          client: { select: { name: true } },
        },
      }),
      prisma.expense.findMany({
        where: {
          dueDate: { gte: startDate, lte: endDate },
        },
      }),
      prisma.commission.aggregate({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalCommissions = commissions._sum.amount || 0;

    return {
      period: { start: startDate, end: endDate },
      revenue: { total: totalRevenue, items: payments },
      expenses: { total: totalExpenses, items: expenses },
      commissions: { total: totalCommissions },
      netProfit: totalRevenue - totalExpenses - totalCommissions,
    };
  }

  async getCommissions(staffId?: string, startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (staffId) where.staffId = staffId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const commissions = await prisma.commission.findMany({
      where,
      include: {
        staff: {
          include: {
            user: { select: { name: true } },
          },
        },
        payment: {
          include: {
            appointment: { select: { startTime: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = commissions.reduce((sum, c) => sum + c.amount, 0);
    const paid = commissions.filter(c => c.isPaid).reduce((sum, c) => sum + c.amount, 0);

    return {
      commissions,
      summary: { total, paid, pending: total - paid },
    };
  }
}
