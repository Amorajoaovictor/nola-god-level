import { NextRequest } from 'next/server';
import { asyncHandler } from '@/lib/middleware/error.middleware';
import { successResponse } from '@/lib/utils/response.utils';
import prisma from '@/lib/prisma/client';

/**
 * GET /api/products/stats
 * Get total revenue and quantity for all products
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  const stats = await prisma.productSale.aggregate({
    _sum: {
      totalPrice: true,
      quantity: true,
    },
    _count: {
      id: true,
    },
  });

  return successResponse({
    totalRevenue: Number(stats._sum.totalPrice || 0),
    totalQuantity: Number(stats._sum.quantity || 0),
    totalSales: stats._count.id,
  });
});
