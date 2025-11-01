import { NextRequest } from 'next/server';
import { CustomerService } from '@/lib/services/customer.service';
import { asyncHandler } from '@/lib/middleware/error.middleware';
import { validatePagination } from '@/lib/middleware/validation.middleware';
import { paginatedResponse } from '@/lib/utils/response.utils';

const customerService = new CustomerService();

export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const { page, limit } = validatePagination(searchParams);

  const result = await customerService.getAllCustomers(page, limit);

  return paginatedResponse(result.data, page, limit, result.total);
});
