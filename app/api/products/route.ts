import { NextRequest } from 'next/server';
import { ProductService } from '@/lib/services/product.service';
import { asyncHandler } from '@/lib/middleware/error.middleware';
import { validatePagination } from '@/lib/middleware/validation.middleware';
import { paginatedResponse, successResponse } from '@/lib/utils/response.utils';

const productService = new ProductService();

export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const searchTerm = searchParams.get('search');

  if (searchTerm) {
    const products = await productService.searchProducts(searchTerm);
    return successResponse(products);
  }

  const { page, limit } = validatePagination(searchParams);
  const result = await productService.getAllProducts(page, limit);

  return paginatedResponse(result.data, page, limit, result.total);
});
