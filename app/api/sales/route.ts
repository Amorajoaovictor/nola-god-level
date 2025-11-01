import { NextRequest } from 'next/server';
import { SaleService } from '@/lib/services/sale.service';
import { asyncHandler } from '@/lib/middleware/error.middleware';
import { validatePagination } from '@/lib/middleware/validation.middleware';
import { paginatedResponse } from '@/lib/utils/response.utils';

const saleService = new SaleService();

/**
 * GET /api/sales
 * Get all sales with pagination
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const { page, limit } = validatePagination(searchParams);

  const result = await saleService.getAllSales(page, limit);

  return paginatedResponse(result.data, page, limit, result.total);
});
