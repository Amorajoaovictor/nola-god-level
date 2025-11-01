import { Customer, Prisma } from '@prisma/client';
import prisma from '@/lib/prisma/client';
import { IBaseRepository } from './base.repository';

export interface ICustomerRepository extends IBaseRepository<Customer> {
  findByEmail(email: string): Promise<Customer | null>;
  findByPhone(phone: string): Promise<Customer | null>;
  findByCpf(cpf: string): Promise<Customer | null>;
  getCustomerLifetimeValue(customerId: number): Promise<number>;
}

export class CustomerRepository implements ICustomerRepository {
  async findAll(params?: {
    skip?: number;
    take?: number;
  }): Promise<Customer[]> {
    return prisma.customer.findMany({
      skip: params?.skip,
      take: params?.take,
      include: {
        store: true,
        subBrand: true,
      },
    });
  }

  async findById(id: number): Promise<Customer | null> {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        store: true,
        subBrand: true,
        sales: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return prisma.customer.findFirst({
      where: { email },
    });
  }

  async findByPhone(phone: string): Promise<Customer | null> {
    return prisma.customer.findFirst({
      where: { phoneNumber: phone },
    });
  }

  async findByCpf(cpf: string): Promise<Customer | null> {
    return prisma.customer.findFirst({
      where: { cpf },
    });
  }

  async getCustomerLifetimeValue(customerId: number): Promise<number> {
    const result = await prisma.sale.aggregate({
      where: { customerId },
      _sum: {
        totalAmount: true,
      },
    });
    return Number(result._sum.totalAmount ?? 0);
  }

  async create(data: Prisma.CustomerCreateInput): Promise<Customer> {
    return prisma.customer.create({
      data,
    });
  }

  async update(id: number, data: Prisma.CustomerUpdateInput): Promise<Customer> {
    return prisma.customer.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Customer> {
    return prisma.customer.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return prisma.customer.count();
  }
}
