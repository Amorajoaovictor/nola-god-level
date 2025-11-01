import { Sale } from '@prisma/client';
import { SaleRepository, ISaleRepository } from '@/lib/repositories/sale.repository';

export interface ISaleService {
  getAllSales(page?: number, limit?: number): Promise<{ data: Sale[]; total: number; page: number; limit: number }>;
  getSaleById(id: number): Promise<Sale | null>;
  getSalesByStore(storeId: number, page?: number, limit?: number): Promise<{ data: Sale[]; total: number }>;
  getSalesByChannel(channelId: number, page?: number, limit?: number): Promise<Sale[]>;
  getSalesByDateRange(startDate: Date, endDate: Date, page?: number, limit?: number): Promise<Sale[]>;
  getStoreTotalSales(storeId: number): Promise<number>;
  getAverageTicket(storeId?: number, channelId?: number): Promise<number>;
  getSalesSummary(storeId?: number, startDate?: Date, endDate?: Date): Promise<any>;
}

export class SaleService implements ISaleService {
  private repository: ISaleRepository;

  constructor(repository?: ISaleRepository) {
    this.repository = repository ?? new SaleRepository();
  }

  async getAllSales(
    page = 1,
    limit = 50
  ): Promise<{ data: Sale[]; total: number; page: number; limit: number }> {
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
    endDate?: Date
  ): Promise<any> {
    const averageTicket = await this.getAverageTicket(storeId);
    const totalSales = storeId 
      ? await this.repository.getTotalSalesByStore(storeId)
      : 0;
    const salesCount = await this.repository.count({ storeId });

    return {
      totalRevenue: totalSales,
      averageTicket,
      totalSales: salesCount,
      period: {
        startDate,
        endDate,
      },
    };
  }
}
