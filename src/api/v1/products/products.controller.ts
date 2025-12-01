import { Request, Response } from 'express';
import { ProductsService } from './products.service';
import { logger } from '../../../utils/logger';

export class ProductsController {
  private productsService: ProductsService;

  constructor() {
    this.productsService = new ProductsService();
  }

  /**
   * Criar um novo produto
   * POST /api/v1/products
   */
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await this.productsService.create(req.body);
      
      logger.info(`Product created: ${product.id}`);
      
      res.status(201).json({
        status: 'success',
        data: { product },
      });
    } catch (error: any) {
      logger.error('Error creating product:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to create product',
      });
    }
  };

  /**
   * Listar todos os produtos
   * GET /api/v1/products
   */
  list = async (req: Request, res: Response): Promise<void> => {
    try {
      const { category, isActive, lowStock } = req.query;
      
      const filters: any = {};
      if (category) filters.category = category as string;
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (lowStock === 'true') filters.lowStock = true;

      const products = await this.productsService.list(filters);
      
      res.json({
        status: 'success',
        data: products,
      });
    } catch (error: any) {
      logger.error('Error listing products:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to list products',
      });
    }
  };

  /**
   * Buscar produto por ID
   * GET /api/v1/products/:id
   */
  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await this.productsService.getById(id);
      
      if (!product) {
        res.status(404).json({
          status: 'error',
          message: 'Product not found',
        });
        return;
      }

      res.json({
        status: 'success',
        data: { product },
      });
    } catch (error: any) {
      logger.error('Error getting product:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to get product',
      });
    }
  };

  /**
   * Atualizar produto
   * PUT /api/v1/products/:id
   */
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await this.productsService.update(id, req.body);
      
      logger.info(`Product updated: ${id}`);
      
      res.json({
        status: 'success',
        data: { product },
      });
    } catch (error: any) {
      logger.error('Error updating product:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to update product',
      });
    }
  };

  /**
   * Deletar produto (soft delete)
   * DELETE /api/v1/products/:id
   */
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.productsService.delete(id);
      
      logger.info(`Product deleted: ${id}`);
      
      res.json({
        status: 'success',
        message: 'Product deleted successfully',
      });
    } catch (error: any) {
      logger.error('Error deleting product:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to delete product',
      });
    }
  };

  /**
   * Adicionar estoque
   * POST /api/v1/products/:id/stock/add
   */
  addStock = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { quantity, reason, reference } = req.body;
      
      const product = await this.productsService.addStock(id, quantity, reason, reference);
      
      logger.info(`Stock added to product ${id}: +${quantity}`);
      
      res.json({
        status: 'success',
        data: { product },
      });
    } catch (error: any) {
      logger.error('Error adding stock:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to add stock',
      });
    }
  };

  /**
   * Remover estoque
   * POST /api/v1/products/:id/stock/remove
   */
  removeStock = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { quantity, reason, reference } = req.body;
      
      const product = await this.productsService.removeStock(id, quantity, reason, reference);
      
      logger.info(`Stock removed from product ${id}: -${quantity}`);
      
      res.json({
        status: 'success',
        data: { product },
      });
    } catch (error: any) {
      logger.error('Error removing stock:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to remove stock',
      });
    }
  };

  /**
   * Histórico de movimentações
   * GET /api/v1/products/:id/movements
   */
  getMovements = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const movements = await this.productsService.getMovements(id);
      
      res.json({
        status: 'success',
        data: movements,
      });
    } catch (error: any) {
      logger.error('Error getting movements:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to get movements',
      });
    }
  };
}

export const productsController = new ProductsController();
