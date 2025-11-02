import { NextRequest } from 'next/server';
import { SaleService } from '@/lib/services/sale.service';
import { asyncHandler } from '@/lib/middleware/error.middleware';
import { validatePagination } from '@/lib/middleware/validation.middleware';
import { paginatedResponse } from '@/lib/utils/response.utils';

const saleService = new SaleService();

/**
 * GET /api/sales
 * Get all sales with pagination and filters
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const { page, limit } = validatePagination(searchParams);
  
  // Extract filter parameters
  const storeIds = searchParams.getAll('storeId').map(id => parseInt(id));
  const channelIdStr = searchParams.get('channelId');
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');
  const status = searchParams.get('status');
  const daysOfWeek = searchParams.getAll('daysOfWeek');

  const filters = {
    storeIds: storeIds.length > 0 ? storeIds : undefined,
    channelId: channelIdStr ? parseInt(channelIdStr) : undefined,
    startDate: startDateStr ? new Date(startDateStr) : undefined,
    endDate: endDateStr ? new Date(endDateStr) : undefined,
    status: status || undefined,
    daysOfWeek: daysOfWeek.length > 0 ? daysOfWeek.map(d => parseInt(d)) : undefined,
  };

  const result = await saleService.getAllSales(page, limit, filters);

  return paginatedResponse(result.data, page, limit, result.total);
});
