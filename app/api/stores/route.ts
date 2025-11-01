import { NextRequest } from 'next/server';
import { StoreService } from '@/lib/services/store.service';
import { asyncHandler } from '@/lib/middleware/error.middleware';
import { validatePagination } from '@/lib/middleware/validation.middleware';
import { paginatedResponse, successResponse } from '@/lib/utils/response.utils';

const storeService = new StoreService();

export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const active = searchParams.get('active');

  if (active === 'true') {
    const stores = await storeService.getActiveStores();
    return successResponse(stores);
  }

  const { page, limit } = validatePagination(searchParams);
  const result = await storeService.getAllStores(page, limit);

  return paginatedResponse(result.data, page, limit, result.total);
});
