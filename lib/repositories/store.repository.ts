import { Store, Prisma } from '@prisma/client';
import prisma from '@/lib/prisma/client';
import { IBaseRepository } from './base.repository';

export interface IStoreRepository extends IBaseRepository<Store> {
  findByBrandId(brandId: number): Promise<Store[]>;
  findByCity(city: string): Promise<Store[]>;
  findActive(): Promise<Store[]>;
  getStorePerformance(storeId: number, startDate?: Date, endDate?: Date): Promise<any>;
}

export class StoreRepository implements IStoreRepository {
  async findAll(params?: {
    skip?: number;
    take?: number;
    include?: Prisma.StoreInclude;
  }): Promise<Store[]> {
    return prisma.store.findMany({
      skip: params?.skip,
      take: params?.take,
      include: params?.include ?? {
        brand: true,
        subBrand: true,
      },
    });
  }

  async findById(id: number): Promise<Store | null> {
    return prisma.store.findUnique({
      where: { id },
      include: {
        brand: true,
        subBrand: true,
      },
    });
  }

  async findByBrandId(brandId: number): Promise<Store[]> {
    return prisma.store.findMany({
      where: { brandId },
      include: {
        subBrand: true,
      },
    });
  }

  async findByCity(city: string): Promise<Store[]> {
    return prisma.store.findMany({
      where: {
        city: {
          contains: city,
          mode: 'insensitive',
        },
      },
      include: {
        brand: true,
      },
    });
  }

  async findActive(): Promise<Store[]> {
    return prisma.store.findMany({
      where: { isActive: true },
      include: {
        brand: true,
      },
    });
  }

  async getStorePerformance(
    storeId: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<any> {
    const salesData = await prisma.sale.aggregate({
      where: {
        storeId,
        ...(startDate && endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
      },
      _sum: {
        totalAmount: true,
        totalDiscount: true,
      },
      _avg: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      storeId,
      totalRevenue: Number(salesData._sum.totalAmount ?? 0),
      totalDiscount: Number(salesData._sum.totalDiscount ?? 0),
      averageTicket: Number(salesData._avg.totalAmount ?? 0),
      totalSales: salesData._count.id,
    };
  }

  async create(data: Prisma.StoreCreateInput): Promise<Store> {
    return prisma.store.create({
      data,
      include: {
        brand: true,
      },
    });
  }

  async update(id: number, data: Prisma.StoreUpdateInput): Promise<Store> {
    return prisma.store.update({
      where: { id },
      data,
      include: {
        brand: true,
      },
    });
  }

  async delete(id: number): Promise<Store> {
    return prisma.store.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  async count(): Promise<number> {
    return prisma.store.count();
  }
}
