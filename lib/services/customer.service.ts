import { Customer } from '@prisma/client';
import { CustomerRepository, ICustomerRepository } from '@/lib/repositories/customer.repository';

export interface ICustomerService {
  getAllCustomers(page?: number, limit?: number): Promise<{ data: Customer[]; total: number; page: number; limit: number }>;
  getCustomerById(id: number): Promise<Customer | null>;
  getCustomerByEmail(email: string): Promise<Customer | null>;
  getCustomerByPhone(phone: string): Promise<Customer | null>;
  getCustomerByCpf(cpf: string): Promise<Customer | null>;
  getCustomerProfile(customerId: number): Promise<any>;
}

export class CustomerService implements ICustomerService {
  private repository: ICustomerRepository;

  constructor(repository?: ICustomerRepository) {
    this.repository = repository ?? new CustomerRepository();
  }

  async getAllCustomers(
    page = 1,
    limit = 50
  ): Promise<{ data: Customer[]; total: number; page: number; limit: number }> {
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

  async getCustomerById(id: number): Promise<Customer | null> {
    return this.repository.findById(id);
  }

  async getCustomerByEmail(email: string): Promise<Customer | null> {
    return this.repository.findByEmail(email);
  }

  async getCustomerByPhone(phone: string): Promise<Customer | null> {
    return this.repository.findByPhone(phone);
  }

  async getCustomerByCpf(cpf: string): Promise<Customer | null> {
    return this.repository.findByCpf(cpf);
  }

  async getCustomerProfile(customerId: number): Promise<any> {
    const customer = await this.repository.findById(customerId);
    if (!customer) {
      throw new Error(`Customer with ID ${customerId} not found`);
    }

    const lifetimeValue = await this.repository.getCustomerLifetimeValue(customerId);
    
    // Type assertion since we know findById includes sales
    const customerWithSales = customer as typeof customer & { sales?: any[] };

    return {
      customer: {
        id: customer.id,
        name: customer.customerName,
        email: customer.email,
        phone: customer.phoneNumber,
        createdAt: customer.createdAt,
      },
      stats: {
        lifetimeValue,
        totalOrders: customerWithSales.sales?.length ?? 0,
      },
    };
  }
}
