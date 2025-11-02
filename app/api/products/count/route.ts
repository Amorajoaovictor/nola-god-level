import { NextRequest } from 'next/server';
import { asyncHandler } from '@/lib/middleware/error.middleware';
import { successResponse } from '@/lib/utils/response.utils';
import prisma from '@/lib/prisma/client';

/**
 * GET /api/products/count
 * Get total count of products
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  const totalProducts = await prisma.product.count({
    where: {
      deletedAt: null,
    },
  });

  return successResponse({ total: totalProducts });
});
