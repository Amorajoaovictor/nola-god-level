import { Store } from '@prisma/client';
import { StoreRepository, IStoreRepository } from '@/lib/repositories/store.repository';

export interface IStoreService {
  getAllStores(page?: number, limit?: number): Promise<{ data: Store[]; total: number; page: number; limit: number }>;
  getStoreById(id: number): Promise<Store | null>;
  getStoresByBrand(brandId: number): Promise<Store[]>;
  getStoresByCity(city: string): Promise<Store[]>;
  getActiveStores(): Promise<Store[]>;
  getStorePerformance(storeId: number, startDate?: Date, endDate?: Date): Promise<any>;
}

export class StoreService implements IStoreService {
  private repository: IStoreRepository;

  constructor(repository?: IStoreRepository) {
    this.repository = repository ?? new StoreRepository();
  }

  async getAllStores(
    page = 1,
    limit = 50
  ): Promise<{ data: Store[]; total: number; page: number; limit: number }> {
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

  async getStoreById(id: number): Promise<Store | null> {
    return this.repository.findById(id);
  }

  async getStoresByBrand(brandId: number): Promise<Store[]> {
    return this.repository.findByBrandId(brandId);
  }

  async getStoresByCity(city: string): Promise<Store[]> {
    if (!city || city.trim().length < 2) {
      throw new Error('City name must be at least 2 characters long');
    }
    return this.repository.findByCity(city);
  }

  async getActiveStores(): Promise<Store[]> {
    return this.repository.findActive();
  }

  async getStorePerformance(
    storeId: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<any> {
    const store = await this.repository.findById(storeId);
    if (!store) {
      throw new Error(`Store with ID ${storeId} not found`);
    }

    const performance = await this.repository.getStorePerformance(
      storeId,
      startDate,
      endDate
    );

    return {
      store: {
        id: store.id,
        name: store.name,
        city: store.city,
        state: store.state,
      },
      performance,
    };
  }
}
