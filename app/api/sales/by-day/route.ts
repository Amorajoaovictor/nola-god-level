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
  const storeIdStr = searchParams.get('storeId');
  const channelIdStr = searchParams.get('channelId');
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');
  const status = searchParams.get('status');
  const dayOfWeekStr = searchParams.get('dayOfWeek');

  let startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Se startDate for fornecido nos filtros, usa ele
  if (startDateStr) {
    startDate = new Date(startDateStr);
  }

  let endDate = new Date();
  if (endDateStr) {
    endDate = new Date(endDateStr);
  }

  // Construir condições WHERE
  const conditions: string[] = ['created_at >= $1', 'created_at <= $2'];
  const params: any[] = [startDate, endDate];
  let paramIndex = 3;

  if (storeIdStr) {
    conditions.push(`store_id = $${paramIndex}`);
    params.push(parseInt(storeIdStr));
    paramIndex++;
  }

  if (channelIdStr) {
    conditions.push(`channel_id = $${paramIndex}`);
    params.push(parseInt(channelIdStr));
    paramIndex++;
  }

  if (status) {
    conditions.push(`sale_status_desc = $${paramIndex}`);
    params.push(status);
    paramIndex++;
  }

  if (dayOfWeekStr) {
    conditions.push(`EXTRACT(DOW FROM created_at) = $${paramIndex}`);
    params.push(parseInt(dayOfWeekStr));
    paramIndex++;
  }

  const whereClause = conditions.join(' AND ');

  const sales = await prisma.$queryRawUnsafe<Array<{
    date: Date;
    total_sales: bigint;
    total_revenue: any;
  }>>(
    `
    SELECT 
      DATE(created_at) as date,
      COUNT(*)::bigint as total_sales,
      SUM(total_amount) as total_revenue
    FROM sales
    WHERE ${whereClause}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
    `,
    ...params
  );

  const formattedData = sales.map((item: any) => ({
    date: new Date(item.date).toISOString().split('T')[0],
    totalSales: Number(item.total_sales),
    totalRevenue: Number(item.total_revenue || 0),
  }));

  return successResponse(formattedData);
});
