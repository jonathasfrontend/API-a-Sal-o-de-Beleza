import { PrismaClient, Service } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateServiceDTO {
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  category: string;
  allowsCombo?: boolean;
}

interface UpdateServiceDTO {
  name?: string;
  description?: string;
  durationMinutes?: number;
  price?: number;
  category?: string;
  isActive?: boolean;
  allowsCombo?: boolean;
}

interface ServiceFilters {
  category?: string;
  isActive?: boolean;
}

export class ServicesService {
  /**
   * Criar um novo serviço
   */
  async create(data: CreateServiceDTO): Promise<Service> {
    return await prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        durationMinutes: data.durationMinutes,
        price: data.price,
        category: data.category,
        allowsCombo: data.allowsCombo ?? true,
      },
    });
  }

  /**
   * Listar serviços com filtros
   */
  async list(filters: ServiceFilters = {}): Promise<Service[]> {
    const where: any = {};
    
    if (filters.category) {
      where.category = filters.category;
    }
    
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return await prisma.service.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  /**
   * Buscar serviço por ID
   */
  async getById(id: string): Promise<Service | null> {
    return await prisma.service.findUnique({
      where: { id },
    });
  }

  /**
   * Atualizar serviço
   */
  async update(id: string, data: UpdateServiceDTO): Promise<Service> {
    return await prisma.service.update({
      where: { id },
      data,
    });
  }

  /**
   * Deletar serviço (soft delete)
   */
  async delete(id: string): Promise<Service> {
    return await prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Listar categorias únicas
   */
  async listCategories(): Promise<string[]> {
    const services = await prisma.service.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    
    return services.map(s => s.category);
  }
}
