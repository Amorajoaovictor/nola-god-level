import { Sale } from '@prisma/client';
import { SaleRepository, ISaleRepository } from '@/lib/repositories/sale.repository';

export interface ISaleService {
  getAllSales(page?: number, limit?: number, filters?: any): Promise<{ data: Sale[]; total: number; page: number; limit: number }>;
  getSaleById(id: number): Promise<Sale | null>;
  getSalesByStore(storeId: number, page?: number, limit?: number): Promise<{ data: Sale[]; total: number }>;
  getSalesByChannel(channelId: number, page?: number, limit?: number): Promise<Sale[]>;
  getSalesByDateRange(startDate: Date, endDate: Date, page?: number, limit?: number): Promise<Sale[]>;
  getStoreTotalSales(storeId: number): Promise<number>;
  getAverageTicket(storeId?: number, channelId?: number): Promise<number>;
  getSalesSummary(storeId?: number, startDate?: Date, endDate?: Date, dayOfWeek?: number): Promise<any>;
}

export class SaleService implements ISaleService {
  private repository: ISaleRepository;

  constructor(repository?: ISaleRepository) {
    this.repository = repository ?? new SaleRepository();
  }

  async getAllSales(
    page = 1,
    limit = 50,
    filters?: any
  ): Promise<{ data: Sale[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    
    // Build where clause based on filters
    const where: any = {};
    if (filters?.storeId) where.storeId = filters.storeId;
    if (filters?.channelId) where.channelId = filters.channelId;
    if (filters?.status) where.saleStatusDesc = filters.status;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }
    
    const [data, total] = await Promise.all([
      this.repository.findAll({ skip, take: limit, where }),
      this.repository.count(where, filters?.dayOfWeek),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async getSaleById(id: number): Promise<Sale | null> {
    return this.repository.findById(id);
  }

  async getSalesByStore(storeId: number, page = 1, limit = 50): Promise<{ data: Sale[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.repository.findByStoreId(storeId, skip, limit),
      this.repository.count({ storeId }),
    ]);
    return { data, total };
  }

  async getSalesByChannel(channelId: number, page = 1, limit = 50): Promise<Sale[]> {
    const skip = (page - 1) * limit;
    return this.repository.findByChannelId(channelId, skip, limit);
  }

  async getSalesByDateRange(
    startDate: Date,
    endDate: Date,
    page = 1,
    limit = 50
  ): Promise<Sale[]> {
    const skip = (page - 1) * limit;
    return this.repository.findByDateRange(startDate, endDate, skip, limit);
  }

  async getStoreTotalSales(storeId: number): Promise<number> {
    return this.repository.getTotalSalesByStore(storeId);
  }

  async getAverageTicket(storeId?: number, channelId?: number): Promise<number> {
    return this.repository.getAverageTicket(storeId, channelId);
  }

  async getSalesSummary(
    storeId?: number,
    startDate?: Date,
    endDate?: Date,
    dayOfWeek?: number
  ): Promise<any> {
    const filters: any = {};
    if (storeId) filters.storeId = storeId;
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.gte = startDate;
      if (endDate) filters.createdAt.lte = endDate;
    }

    const averageTicket = await this.getAverageTicket(storeId);
    const totalRevenue = await this.repository.getTotalRevenue(storeId, dayOfWeek);
    const salesCount = await this.repository.count(filters, dayOfWeek);
    const completedSales = await this.repository.countByStatus('COMPLETED', filters, dayOfWeek);
    const cancelledSales = await this.repository.countByStatus('CANCELLED', filters, dayOfWeek);

    return {
      totalRevenue,
      averageTicket,
      totalSales: salesCount,
      completedSales,
      cancelledSales,
      period: {
        startDate,
        endDate,
      },
    };
  }
}
