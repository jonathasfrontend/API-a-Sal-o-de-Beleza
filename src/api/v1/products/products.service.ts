import { PrismaClient, Product, StockMovement } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateProductDTO {
  sku: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  costPrice: number;
  salePrice: number;
  reorderThreshold?: number;
  supplier?: string;
}

interface UpdateProductDTO {
  sku?: string;
  name?: string;
  description?: string;
  category?: string;
  costPrice?: number;
  salePrice?: number;
  reorderThreshold?: number;
  supplier?: string;
  isActive?: boolean;
}

interface ProductFilters {
  category?: string;
  isActive?: boolean;
  lowStock?: boolean;
}

export class ProductsService {
  /**
   * Criar um novo produto
   */
  async create(data: CreateProductDTO): Promise<Product> {
    // Verificar se SKU já existe
    const existingProduct = await prisma.product.findUnique({
      where: { sku: data.sku },
    });

    if (existingProduct) {
      throw new Error('Product with this SKU already exists');
    }

    const product = await prisma.product.create({
      data: {
        sku: data.sku,
        name: data.name,
        description: data.description,
        category: data.category,
        quantity: data.quantity,
        costPrice: data.costPrice,
        salePrice: data.salePrice,
        reorderThreshold: data.reorderThreshold || 10,
        supplier: data.supplier,
      },
    });

    // Registrar movimentação inicial de estoque
    if (data.quantity > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: 'IN',
          quantity: data.quantity,
          reason: 'Initial stock',
        },
      });
    }

    return product;
  }

  /**
   * Listar produtos com filtros
   */
  async list(filters: ProductFilters = {}): Promise<Product[]> {
    const where: any = {};
    
    if (filters.category) {
      where.category = filters.category;
    }
    
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    
    if (filters.lowStock) {
      where.quantity = {
        lte: prisma.product.fields.reorderThreshold,
      };
    }

    return await prisma.product.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  /**
   * Buscar produto por ID
   */
  async getById(id: string): Promise<Product | null> {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            stockMovements: true,
            saleItems: true,
          },
        },
      },
    });
  }

  /**
   * Atualizar produto
   */
  async update(id: string, data: UpdateProductDTO): Promise<Product> {
    // Se estiver alterando o SKU, verificar se já existe
    if (data.sku) {
      const existingProduct = await prisma.product.findFirst({
        where: {
          sku: data.sku,
          NOT: { id },
        },
      });

      if (existingProduct) {
        throw new Error('Product with this SKU already exists');
      }
    }

    return await prisma.product.update({
      where: { id },
      data,
    });
  }

  /**
   * Deletar produto (soft delete)
   */
  async delete(id: string): Promise<Product> {
    return await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Adicionar estoque
   */
  async addStock(
    productId: string,
    quantity: number,
    reason?: string,
    reference?: string
  ): Promise<Product> {
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        quantity: {
          increment: quantity,
        },
      },
    });

    await prisma.stockMovement.create({
      data: {
        productId,
        type: 'IN',
        quantity,
        reason,
        reference,
      },
    });

    return product;
  }

  /**
   * Remover estoque
   */
  async removeStock(
    productId: string,
    quantity: number,
    reason?: string,
    reference?: string
  ): Promise<Product> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.quantity < quantity) {
      throw new Error('Insufficient stock');
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        quantity: {
          decrement: quantity,
        },
      },
    });

    await prisma.stockMovement.create({
      data: {
        productId,
        type: 'OUT',
        quantity,
        reason,
        reference,
      },
    });

    return updatedProduct;
  }

  /**
   * Obter histórico de movimentações
   */
  async getMovements(productId: string): Promise<StockMovement[]> {
    return await prisma.stockMovement.findMany({
      where: { productId },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });
  }
}
