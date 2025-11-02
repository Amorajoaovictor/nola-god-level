import { NextRequest } from 'next/server';
import { asyncHandler } from '@/lib/middleware/error.middleware';
import { successResponse } from '@/lib/utils/response.utils';
import prisma from '@/lib/prisma/client';

/**
 * GET /api/sales/by-day
 * Get sales grouped by day
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days') || '30');

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const sales = await prisma.$queryRaw<Array<{
    date: Date;
    total_sales: bigint;
    total_revenue: any;
  }>>`
    SELECT 
      DATE(created_at) as date,
      COUNT(*)::bigint as total_sales,
      SUM(total_amount) as total_revenue
    FROM sales
    WHERE created_at >= ${startDate}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;

  const formattedData = sales.map((item: any) => ({
    date: new Date(item.date).toISOString().split('T')[0],
    totalSales: Number(item.total_sales),
    totalRevenue: Number(item.total_revenue || 0),
  }));

  return successResponse(formattedData);
});
