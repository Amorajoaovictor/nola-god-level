import { NextRequest } from 'next/server';
import { asyncHandler } from '@/lib/middleware/error.middleware';
import { successResponse } from '@/lib/utils/response.utils';
import prisma from '@/lib/prisma/client';

/**
 * GET /api/sales/heatmap
 * Get sales distribution by day of week and hour
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const storeIdStr = searchParams.get('storeId');
  const channelIdStr = searchParams.get('channelId');
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');
  const status = searchParams.get('status');
  const daysStr = searchParams.get('days');
  const daysOfWeek = searchParams.getAll('daysOfWeek'); // Array de dias da semana selecionados

  try {
    // Construir condições WHERE
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Se não houver filtro de data, usar últimos 30 dias
    let startDate = startDateStr ? new Date(startDateStr) : new Date();
    if (!startDateStr) {
      const days = daysStr ? parseInt(daysStr) : 30;
      startDate.setDate(startDate.getDate() - days);
    }
    
    conditions.push(`created_at >= $${paramIndex}`);
    params.push(startDate);
    paramIndex++;

    if (endDateStr) {
      conditions.push(`created_at <= $${paramIndex}`);
      params.push(new Date(endDateStr));
      paramIndex++;
    } else {
      conditions.push(`created_at <= $${paramIndex}`);
      params.push(new Date());
      paramIndex++;
    }

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

    // Filtrar por dias da semana selecionados
    if (daysOfWeek.length > 0) {
      const dayNumbers = daysOfWeek.map(d => parseInt(d));
      conditions.push(`EXTRACT(DOW FROM created_at)::int = ANY($${paramIndex})`);
      params.push(dayNumbers);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    console.log('Heatmap query:', whereClause);
    console.log('Heatmap params:', params);

    const sales = await prisma.$queryRawUnsafe<Array<{
      day_of_week: number;
      hour: number;
      total_sales: bigint;
      total_revenue: any;
    }>>(
      `
      SELECT 
        EXTRACT(DOW FROM created_at)::int as day_of_week,
        EXTRACT(HOUR FROM created_at)::int as hour,
        COUNT(*)::bigint as total_sales,
        SUM(total_amount) as total_revenue
      FROM sales
      WHERE ${whereClause}
      GROUP BY day_of_week, hour
      ORDER BY day_of_week, hour
      `,
      ...params
    );

    console.log('Heatmap results:', sales.length);

    const formattedData = sales.map((item: any) => ({
      dayOfWeek: Number(item.day_of_week),
      hour: Number(item.hour),
      totalSales: Number(item.total_sales),
      totalRevenue: Number(item.total_revenue || 0),
    }));

    return successResponse(formattedData);
  } catch (error) {
    console.error('Heatmap error:', error);
    throw error;
  }
});
