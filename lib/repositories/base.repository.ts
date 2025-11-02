/**
 * Base Repository Interface
 * All repositories should implement these basic CRUD operations
 */
export interface IBaseRepository<T> {
  findAll(params?: any): Promise<T[]>;
  findById(id: number): Promise<T | null>;
  create(data: any): Promise<T>;
  update(id: number, data: any): Promise<T>;
  delete(id: number): Promise<T>;
  count(params?: any, daysOfWeek?: number[]): Promise<number>;
}
