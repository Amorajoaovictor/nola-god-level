import { Product } from '@prisma/client';
import { ProductRepository, IProductRepository } from '@/lib/repositories/product.repository';

export interface IProductService {
  getAllProducts(page?: number, limit?: number): Promise<{ data: Product[]; total: number; page: number; limit: number }>;
  getProductById(id: number): Promise<Product | null>;
  getProductsByBrand(brandId: number): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  searchProducts(name: string): Promise<Product[]>;
  getTopSellingProducts(limit?: number): Promise<any[]>;
}

export class ProductService implements IProductService {
  private repository: IProductRepository;

  constructor(repository?: IProductRepository) {
    this.repository = repository ?? new ProductRepository();
  }

  async getAllProducts(
    page = 1,
    limit = 50
  ): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.repository.findAll({ skip, take: limit }),
      this.repository.count(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async getProductById(id: number): Promise<Product | null> {
    return this.repository.findById(id);
  }

  async getProductsByBrand(brandId: number): Promise<Product[]> {
    return this.repository.findByBrandId(brandId);
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return this.repository.findByCategoryId(categoryId);
  }

  async searchProducts(name: string): Promise<Product[]> {
    if (!name || name.trim().length < 2) {
      throw new Error('Search term must be at least 2 characters long');
    }
    return this.repository.searchByName(name);
  }

  async getTopSellingProducts(limit = 10): Promise<any[]> {
    return this.repository.findTopSelling(limit);
  }
}
