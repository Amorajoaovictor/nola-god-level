import { NextRequest } from 'next/server';
import { asyncHandler } from '@/lib/middleware/error.middleware';
import { successResponse } from '@/lib/utils/response.utils';
import prisma from '@/lib/prisma/client';

/**
 * GET /api/products/stats
 * Get total revenue and quantity for all products (with optional filters)
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const storeIdStr = searchParams.get('storeId');
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');

  // Construir where clause para filtros
  const whereClause: any = {};
  
  if (storeIdStr || startDateStr || endDateStr) {
    whereClause.sale = {};
    
    if (storeIdStr) {
      whereClause.sale.storeId = parseInt(storeIdStr);
    }
    
    if (startDateStr || endDateStr) {
      whereClause.sale.createdAt = {};
      if (startDateStr) {
        whereClause.sale.createdAt.gte = new Date(startDateStr);
      }
      if (endDateStr) {
        const endDateTime = new Date(endDateStr);
        endDateTime.setHours(23, 59, 59, 999);
        whereClause.sale.createdAt.lte = endDateTime;
      }
    }
  }

  const stats = await prisma.productSale.aggregate({
    where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
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
