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
  getSalesSummary(storeId?: number, startDate?: Date, endDate?: Date, daysOfWeek?: number[]): Promise<any>;
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
    
    // Se há filtro de dias da semana, usar query raw SQL
    if (filters?.daysOfWeek && filters.daysOfWeek.length > 0) {
      // Construir objeto de filtros para passar ao repository
      const filterParams: any = {};
      if (filters.storeId) filterParams.storeId = filters.storeId;
      if (filters.channelId) filterParams.channelId = filters.channelId;
      if (filters.status) filterParams.status = filters.status;
      if (filters.startDate) filterParams.startDate = filters.startDate;
      if (filters.endDate) filterParams.endDate = filters.endDate;
      
      const [data, total] = await Promise.all([
        this.repository.findByDaysOfWeek(filters.daysOfWeek, skip, limit, filterParams),
        this.repository.count(filterParams, filters.daysOfWeek),
      ]);
      
      return {
        data,
        total,
        page,
        limit,
      };
    }
    
    // Build where clause based on filters (quando NÃO há filtro de dias)
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
      this.repository.count(where),
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
    daysOfWeek?: number[]
  ): Promise<any> {
    const filters: any = {};
    if (storeId) filters.storeId = storeId;
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.gte = startDate;
      if (endDate) filters.createdAt.lte = endDate;
    }

    const averageTicket = await this.getAverageTicket(storeId);
    const totalRevenue = await this.repository.getTotalRevenue(storeId, daysOfWeek);
    const salesCount = await this.repository.count(filters, daysOfWeek);
    const completedSales = await this.repository.countByStatus('COMPLETED', filters, daysOfWeek);
    const cancelledSales = await this.repository.countByStatus('CANCELLED', filters, daysOfWeek);

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
