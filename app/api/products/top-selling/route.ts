import { NextRequest } from 'next/server';
import { ProductService } from '@/lib/services/product.service';
import { asyncHandler } from '@/lib/middleware/error.middleware';
import { successResponse } from '@/lib/utils/response.utils';

const productService = new ProductService();

export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const limitStr = searchParams.get('limit');
  const limit = limitStr ? parseInt(limitStr) : 10;
  const storeIdStr = searchParams.get('storeId');
  const storeId = storeIdStr ? parseInt(storeIdStr) : undefined;
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const topProducts = await productService.getTopSellingProducts(
    limit,
    startDate || undefined,
    endDate || undefined,
    storeId
  );

  return successResponse(topProducts);
});
