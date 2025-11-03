import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "@/lib/middleware/error.middleware";
import prisma from "@/lib/prisma/client";

/**
 * GET /api/sales/delivery-times
 * Retorna estatísticas de tempo de entrega
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  
  const storeIds = searchParams.getAll("storeId").map(Number);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const daysOfWeek = searchParams.getAll("daysOfWeek").map(Number);

  // Construir filtros para SQL
  let dateFilter = "";
  let storeFilter = "";
  
  if (startDate || endDate) {
    if (startDate && endDate) {
      dateFilter = `AND s.created_at >= '${startDate}' AND s.created_at <= '${endDate}'`;
    } else if (startDate) {
      dateFilter = `AND s.created_at >= '${startDate}'`;
    } else if (endDate) {
      dateFilter = `AND s.created_at <= '${endDate}'`;
    }
  } else {
    // Últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    dateFilter = `AND s.created_at >= '${thirtyDaysAgo.toISOString()}'`;
  }

  if (storeIds.length > 0) {
    storeFilter = `AND s.store_id IN (${storeIds.join(',')})`;
  }

  let dayOfWeekFilter = "";
  if (daysOfWeek.length > 0) {
    dayOfWeekFilter = `AND EXTRACT(DOW FROM s.created_at)::int IN (${daysOfWeek.join(',')})`;
  }

  // Query SQL otimizada para estatísticas gerais
  const statsQuery = `
    SELECT 
      ROUND(AVG(s.delivery_seconds / 60.0))::int as avg_delivery_minutes,
      ROUND(AVG(s.production_seconds / 60.0))::int as avg_preparation_minutes,
      ROUND(MIN(s.delivery_seconds / 60.0))::int as min_delivery_minutes,
      ROUND(MAX(s.delivery_seconds / 60.0))::int as max_delivery_minutes,
      COUNT(*)::int as total_orders
    FROM sales s
    WHERE s.delivery_seconds IS NOT NULL
      ${dateFilter}
      ${storeFilter}
      ${dayOfWeekFilter}
    LIMIT 1
  `;

  // Query SQL otimizada para estatísticas por loja
  const storeStatsQuery = `
    SELECT 
      st.name as store_name,
      COUNT(*)::int as count,
      ROUND(AVG(s.delivery_seconds / 60.0))::int as avg_delivery_minutes,
      ROUND(AVG(s.production_seconds / 60.0))::int as avg_preparation_minutes
    FROM sales s
    JOIN stores st ON s.store_id = st.id
    WHERE s.delivery_seconds IS NOT NULL
      ${dateFilter}
      ${storeFilter}
      ${dayOfWeekFilter}
    GROUP BY st.id, st.name
    ORDER BY count DESC
    LIMIT 20
  `;

  const [statsResults, storeStatsResults]: any[] = await Promise.all([
    prisma.$queryRawUnsafe(statsQuery),
    prisma.$queryRawUnsafe(storeStatsQuery),
  ]);

  const stats = statsResults[0] || {
    avg_delivery_minutes: 0,
    avg_preparation_minutes: 0,
    min_delivery_minutes: 0,
    max_delivery_minutes: 0,
    total_orders: 0,
  };

  const storeStats = storeStatsResults.map((row: any) => ({
    storeName: row.store_name,
    count: Number(row.count),
    avgDeliveryTime: Number(row.avg_delivery_minutes),
    avgPreparationTime: Number(row.avg_preparation_minutes),
  }));

  return NextResponse.json({
    avgDeliveryTime: Number(stats.avg_delivery_minutes),
    avgPreparationTime: Number(stats.avg_preparation_minutes),
    minDeliveryTime: Number(stats.min_delivery_minutes),
    maxDeliveryTime: Number(stats.max_delivery_minutes),
    totalOrders: Number(stats.total_orders),
    storeStats,
  });
});
