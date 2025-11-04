import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "@/lib/middleware/error.middleware";
import prisma from "@/lib/prisma/client";

/**
 * GET /api/sales/delivery-times
 * Retorna estatísticas de tempo de entrega
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  
  const storeIds = searchParams.getAll("storeId").map(Number).filter(id => !isNaN(id));
  const startDateStr = searchParams.get("startDate");
  const endDateStr = searchParams.get("endDate");
  const daysOfWeek = searchParams.getAll("daysOfWeek").map(Number).filter(d => !isNaN(d));

  console.log('[delivery-times] Filters:', { storeIds, startDateStr, endDateStr, daysOfWeek });

  // Determinar datas
  let startDate: Date;
  let endDate: Date;
  
  if (startDateStr && endDateStr) {
    startDate = new Date(startDateStr);
    endDate = new Date(endDateStr);
  } else if (startDateStr) {
    startDate = new Date(startDateStr);
    endDate = new Date(); // até agora
  } else if (endDateStr) {
    // Últimos 30 dias até endDate
    endDate = new Date(endDateStr);
    startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 30);
  } else {
    // Últimos 30 dias
    endDate = new Date();
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
  }

  // Construir WHERE clause com prepared statements
  const conditions: string[] = ["s.delivery_seconds IS NOT NULL"];
  const params: any[] = [];
  let paramIndex = 1;

  // Filtro de data
  conditions.push(`s.created_at >= $${paramIndex++}`);
  params.push(startDate);
  conditions.push(`s.created_at <= $${paramIndex++}`);
  params.push(endDate);

  // Filtro de loja
  if (storeIds.length > 0) {
    conditions.push(`s.store_id IN (${storeIds.map((_, i) => `$${paramIndex + i}`).join(',')})`);
    params.push(...storeIds);
    paramIndex += storeIds.length;
  }

  // Filtro de dia da semana
  if (daysOfWeek.length > 0) {
    conditions.push(`EXTRACT(DOW FROM s.created_at)::int IN (${daysOfWeek.map((_, i) => `$${paramIndex + i}`).join(',')})`);
    params.push(...daysOfWeek);
    paramIndex += daysOfWeek.length;
  }

  const whereClause = conditions.join(' AND ');

  console.log('[delivery-times] WHERE clause:', whereClause);
  console.log('[delivery-times] Params:', params);

  // Query SQL otimizada para estatísticas gerais
  const statsQuery = `
    SELECT 
      ROUND(AVG(s.delivery_seconds / 60.0))::int as avg_delivery_minutes,
      ROUND(AVG(s.production_seconds / 60.0))::int as avg_preparation_minutes,
      ROUND(MIN(s.delivery_seconds / 60.0))::int as min_delivery_minutes,
      ROUND(MAX(s.delivery_seconds / 60.0))::int as max_delivery_minutes,
      COUNT(*)::int as total_orders
    FROM sales s
    WHERE ${whereClause}
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
    WHERE ${whereClause}
    GROUP BY st.id, st.name
    ORDER BY count DESC
    LIMIT 20
  `;

  const [statsResults, storeStatsResults]: any[] = await Promise.all([
    prisma.$queryRawUnsafe(statsQuery, ...params),
    prisma.$queryRawUnsafe(storeStatsQuery, ...params),
  ]);

  console.log('[delivery-times] Query results:', { statsResults, storeStatsResults });

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
