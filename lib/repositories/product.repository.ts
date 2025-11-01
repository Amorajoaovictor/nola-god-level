import { Product, Prisma } from '@prisma/client';
import prisma from '@/lib/prisma/client';
import { IBaseRepository } from './base.repository';

export interface IProductRepository extends IBaseRepository<Product> {
  findByBrandId(brandId: number): Promise<Product[]>;
  findByCategoryId(categoryId: number): Promise<Product[]>;
  searchByName(name: string): Promise<Product[]>;
  findTopSelling(limit?: number): Promise<any[]>;
}

export class ProductRepository implements IProductRepository {
  async findAll(params?: {
    skip?: number;
    take?: number;
    include?: Prisma.ProductInclude;
  }): Promise<Product[]> {
    return prisma.product.findMany({
      where: { deletedAt: null },
      skip: params?.skip,
      take: params?.take,
      include: params?.include ?? {
        category: true,
        brand: true,
      },
    });
  }

  async findById(id: number): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        subBrand: true,
      },
    });
  }

  async findByBrandId(brandId: number): Promise<Product[]> {
    return prisma.product.findMany({
      where: {
        brandId,
        deletedAt: null,
      },
      include: {
        category: true,
      },
    });
  }

  async findByCategoryId(categoryId: number): Promise<Product[]> {
    return prisma.product.findMany({
      where: {
        categoryId,
        deletedAt: null,
      },
    });
  }

  async searchByName(name: string): Promise<Product[]> {
    return prisma.product.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
        deletedAt: null,
      },
      include: {
        category: true,
      },
    });
  }

  async findTopSelling(limit = 10): Promise<any[]> {
    const topProducts = await prisma.productSale.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        totalPrice: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    const productsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { category: true },
        });
        return {
          product,
          totalQuantity: item._sum.quantity,
          totalRevenue: item._sum.totalPrice,
          salesCount: item._count.id,
        };
      })
    );

    return productsWithDetails;
  }

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return prisma.product.create({
      data,
      include: {
        category: true,
        brand: true,
      },
    });
  }

  async update(id: number, data: Prisma.ProductUpdateInput): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        brand: true,
      },
    });
  }

  async delete(id: number): Promise<Product> {
    // Soft delete
    return prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async count(): Promise<number> {
    return prisma.product.count({
      where: { deletedAt: null },
    });
  }
}
