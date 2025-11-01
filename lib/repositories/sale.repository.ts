import { Sale, Prisma } from '@prisma/client';
import prisma from '@/lib/prisma/client';
import { IBaseRepository } from './base.repository';

export interface ISaleRepository extends IBaseRepository<Sale> {
  findByStoreId(storeId: number, skip?: number, take?: number): Promise<Sale[]>;
  findByChannelId(channelId: number, skip?: number, take?: number): Promise<Sale[]>;
  findByDateRange(startDate: Date, endDate: Date, skip?: number, take?: number): Promise<Sale[]>;
  getTotalSalesByStore(storeId: number): Promise<number>;
  getAverageTicket(storeId?: number, channelId?: number): Promise<number>;
}

export class SaleRepository implements ISaleRepository {
  async findAll(params?: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.SaleOrderByWithRelationInput;
    include?: Prisma.SaleInclude;
  }): Promise<Sale[]> {
    return prisma.sale.findMany({
      skip: params?.skip,
      take: params?.take,
      orderBy: params?.orderBy ?? { createdAt: 'desc' },
      include: params?.include,
    });
  }

  async findById(id: number): Promise<Sale | null> {
    return prisma.sale.findUnique({
      where: { id },
      include: {
        store: true,
        channel: true,
        customer: true,
        productSales: {
          include: {
            product: true,
            itemProductSales: {
              include: {
                item: true,
                optionGroup: true,
              },
            },
          },
        },
        payments: {
          include: {
            paymentType: true,
          },
        },
        deliverySale: {
          include: {
            deliveryAddresses: true,
          },
        },
      },
    });
  }

  async findByStoreId(storeId: number, skip = 0, take = 50): Promise<Sale[]> {
    return prisma.sale.findMany({
      where: { storeId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        channel: true,
        customer: true,
      },
    });
  }

  async findByChannelId(channelId: number, skip = 0, take = 50): Promise<Sale[]> {
    return prisma.sale.findMany({
      where: { channelId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        store: true,
        customer: true,
      },
    });
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    skip = 0,
    take = 50
  ): Promise<Sale[]> {
    return prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        store: true,
        channel: true,
      },
    });
  }

  async getTotalSalesByStore(storeId: number): Promise<number> {
    const result = await prisma.sale.aggregate({
      where: { storeId },
      _sum: {
        totalAmount: true,
      },
    });
    return Number(result._sum.totalAmount ?? 0);
  }

  async getAverageTicket(storeId?: number, channelId?: number): Promise<number> {
    const result = await prisma.sale.aggregate({
      where: {
        ...(storeId && { storeId }),
        ...(channelId && { channelId }),
      },
      _avg: {
        totalAmount: true,
      },
    });
    return Number(result._avg.totalAmount ?? 0);
  }

  async create(data: Prisma.SaleCreateInput): Promise<Sale> {
    return prisma.sale.create({
      data,
      include: {
        store: true,
        channel: true,
      },
    });
  }

  async update(id: number, data: Prisma.SaleUpdateInput): Promise<Sale> {
    return prisma.sale.update({
      where: { id },
      data,
      include: {
        store: true,
        channel: true,
      },
    });
  }

  async delete(id: number): Promise<Sale> {
    return prisma.sale.delete({
      where: { id },
    });
  }

  async count(params?: { storeId?: number; channelId?: number }): Promise<number> {
    return prisma.sale.count({
      where: {
        ...(params?.storeId && { storeId: params.storeId }),
        ...(params?.channelId && { channelId: params.channelId }),
      },
    });
  }
}
