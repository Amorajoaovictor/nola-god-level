import { Sale, Prisma } from '@prisma/client';
import prisma from '@/lib/prisma/client';
import { IBaseRepository } from './base.repository';

export interface ISaleRepository extends IBaseRepository<Sale> {
  findByStoreId(storeId: number, skip?: number, take?: number): Promise<Sale[]>;
  findByChannelId(channelId: number, skip?: number, take?: number): Promise<Sale[]>;
  findByDateRange(startDate: Date, endDate: Date, skip?: number, take?: number): Promise<Sale[]>;
  findByDaysOfWeek(daysOfWeek: number[], skip?: number, take?: number, filters?: any): Promise<Sale[]>;
  getTotalSalesByStore(storeId: number): Promise<number>;
  getTotalRevenue(storeId?: number, daysOfWeek?: number[], startDate?: Date, endDate?: Date): Promise<number>;
  getAverageTicket(storeId?: number, channelId?: number): Promise<number>;
  countByStatus(status: string, filters?: any, daysOfWeek?: number[]): Promise<number>;
}

export class SaleRepository implements ISaleRepository {
  async findAll(params?: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.SaleOrderByWithRelationInput;
    include?: Prisma.SaleInclude;
    where?: Prisma.SaleWhereInput;
  }): Promise<Sale[]> {
    return prisma.sale.findMany({
      skip: params?.skip,
      take: params?.take,
      where: params?.where,
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

  async findByDaysOfWeek(
    daysOfWeek: number[],
    skip = 0,
    take = 50,
    filters?: any
  ): Promise<Sale[]> {
    // Construir query SQL com filtros
    let query = `
      SELECT s.*, 
             to_jsonb(st.*) as store,
             to_jsonb(ch.*) as channel,
             to_jsonb(cu.*) as customer
      FROM sales s
      LEFT JOIN stores st ON s.store_id = st.id
      LEFT JOIN channels ch ON s.channel_id = ch.id
      LEFT JOIN customers cu ON s.customer_id = cu.id
      WHERE EXTRACT(DOW FROM s.created_at)::int = ANY(ARRAY[${daysOfWeek.join(',')}])
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.storeId) {
      query += ` AND s.store_id = $${paramIndex}`;
      params.push(filters.storeId);
      paramIndex++;
    }

    if (filters?.channelId) {
      query += ` AND s.channel_id = $${paramIndex}`;
      params.push(filters.channelId);
      paramIndex++;
    }

    if (filters?.status) {
      query += ` AND s.sale_status_desc = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters?.startDate) {
      query += ` AND s.created_at >= $${paramIndex}`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters?.endDate) {
      query += ` AND s.created_at <= $${paramIndex}`;
      params.push(filters.endDate);
      paramIndex++;
    }

    query += ` ORDER BY s.created_at DESC LIMIT ${take} OFFSET ${skip}`;

    const result = await prisma.$queryRawUnsafe<any[]>(query, ...params);
    
    // Transformar o resultado para o formato esperado
    return result.map((row: any) => ({
      ...row,
      createdAt: new Date(row.created_at),
      updatedAt: row.updated_at ? new Date(row.updated_at) : null,
      storeId: row.store_id,
      channelId: row.channel_id,
      customerId: row.customer_id,
      totalAmount: row.total_amount,
      totalDiscount: row.total_discount,
      valuePaid: row.value_paid,
      saleStatusDesc: row.sale_status_desc,
    }));
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

  async getTotalRevenue(storeId?: number, daysOfWeek?: number[], startDate?: Date, endDate?: Date): Promise<number> {
    if (daysOfWeek && daysOfWeek.length > 0) {
      // Use raw SQL para filtrar por múltiplos dias da semana
      let query = `
        SELECT COALESCE(SUM("totalAmount"), 0)::numeric as total
        FROM "Sale"
        WHERE EXTRACT(DOW FROM "createdAt")::int = ANY(ARRAY[${daysOfWeek.join(',')}])
      `;
      
      if (storeId) {
        query += ` AND "storeId" = ${storeId}`;
      }
      
      if (startDate) {
        query += ` AND "createdAt" >= '${startDate.toISOString()}'`;
      }
      
      if (endDate) {
        query += ` AND "createdAt" <= '${endDate.toISOString()}'`;
      }
      
      const result = await prisma.$queryRawUnsafe<[{ total: bigint | null }]>(query);
      return Number(result[0]?.total ?? 0);
    }

    const whereClause: any = {};
    if (storeId) whereClause.storeId = storeId;
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = startDate;
      if (endDate) whereClause.createdAt.lte = endDate;
    }

    const result = await prisma.sale.aggregate({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
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

  async count(params?: any, daysOfWeek?: number[]): Promise<number> {
    if (daysOfWeek && daysOfWeek.length > 0) {
      // Use raw SQL para filtrar por múltiplos dias da semana
      let query = `SELECT COUNT(*)::int as count FROM sales WHERE EXTRACT(DOW FROM created_at)::int = ANY(ARRAY[${daysOfWeek.join(',')}])`;
      
      if (params) {
        if (params.storeId) query += ' AND store_id = ' + params.storeId;
        if (params.channelId) query += ' AND channel_id = ' + params.channelId;
        if (params.saleStatusDesc) query += ` AND sale_status_desc = '${params.saleStatusDesc}'`;
        if (params.createdAt?.gte) query += ` AND created_at >= '${params.createdAt.gte.toISOString()}'`;
        if (params.createdAt?.lte) query += ` AND created_at <= '${params.createdAt.lte.toISOString()}'`;
      }
      
      const result = await prisma.$queryRawUnsafe<[{ count: number }]>(query);
      return result[0]?.count ?? 0;
    }

    return prisma.sale.count({
      where: params,
    });
  }

  async countByStatus(status: string, filters?: any, daysOfWeek?: number[]): Promise<number> {
    if (daysOfWeek && daysOfWeek.length > 0) {
      // Use raw SQL para filtrar por múltiplos dias da semana
      let query = `SELECT COUNT(*)::int as count FROM sales WHERE sale_status_desc = '${status}' AND EXTRACT(DOW FROM created_at)::int = ANY(ARRAY[${daysOfWeek.join(',')}])`;
      
      if (filters) {
        if (filters.storeId) query += ' AND store_id = ' + filters.storeId;
        if (filters.channelId) query += ' AND channel_id = ' + filters.channelId;
        if (filters.createdAt?.gte) query += ` AND created_at >= '${filters.createdAt.gte.toISOString()}'`;
        if (filters.createdAt?.lte) query += ` AND created_at <= '${filters.createdAt.lte.toISOString()}'`;
      }
      
      const result = await prisma.$queryRawUnsafe<[{ count: number }]>(query);
      return result[0]?.count ?? 0;
    }

    const where: any = { saleStatusDesc: status };
    if (filters) {
      Object.assign(where, filters);
    }
    return prisma.sale.count({ where });
  }
}
