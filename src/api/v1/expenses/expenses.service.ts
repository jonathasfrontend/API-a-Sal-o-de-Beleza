import { PrismaClient, Expense } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateExpenseDTO {
  description: string;
  category: string;
  amount: number;
  dueDate: Date;
  isRecurring?: boolean;
  notes?: string;
}

interface UpdateExpenseDTO {
  description?: string;
  category?: string;
  amount?: number;
  dueDate?: Date;
  isRecurring?: boolean;
  notes?: string;
}

interface ExpenseFilters {
  category?: string;
  isPaid?: boolean;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
}

export class ExpensesService {
  async create(data: CreateExpenseDTO): Promise<Expense> {
    return await prisma.expense.create({
      data: {
        description: data.description,
        category: data.category,
        amount: data.amount,
        dueDate: data.dueDate,
        isRecurring: data.isRecurring || false,
        notes: data.notes,
      },
    });
  }

  async list(filters: ExpenseFilters = {}): Promise<Expense[]> {
    const where: any = {};
    
    if (filters.category) {
      where.category = filters.category;
    }
    
    if (filters.isPaid !== undefined) {
      where.isPaid = filters.isPaid;
    }
    
    if (filters.dateRange) {
      where.dueDate = {};
      if (filters.dateRange.start) {
        where.dueDate.gte = filters.dateRange.start;
      }
      if (filters.dateRange.end) {
        where.dueDate.lte = filters.dateRange.end;
      }
    }

    return await prisma.expense.findMany({
      where,
      orderBy: {
        dueDate: 'asc',
      },
    });
  }

  async getById(id: string): Promise<Expense | null> {
    return await prisma.expense.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: UpdateExpenseDTO): Promise<Expense> {
    return await prisma.expense.update({
      where: { id },
      data,
    });
  }

  async markAsPaid(id: string): Promise<Expense> {
    return await prisma.expense.update({
      where: { id },
      data: {
        isPaid: true,
        paidDate: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Expense> {
    return await prisma.expense.delete({
      where: { id },
    });
  }
}
