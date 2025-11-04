import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "@/lib/middleware/error.middleware";
import prisma from "@/lib/prisma/client";

/**
 * GET /api/sales/products-by-day
 * Retorna produtos mais populares por dia da semana
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  
  const storeIds = searchParams.getAll("storeId").map(Number).filter(id => !isNaN(id));
  const startDateStr = searchParams.get("startDate");
  const endDateStr = searchParams.get("endDate");
  const limit = parseInt(searchParams.get("limit") || "5");

  console.log('[products-by-day] Filters:', { storeIds, startDateStr, endDateStr, limit });

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
  const conditions: string[] = ["1=1"];
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

  const whereClause = conditions.join(' AND ');
  params.push(limit); // para o LIMIT no final

  console.log('[products-by-day] WHERE clause:', whereClause);
  console.log('[products-by-day] Params:', params);

  console.log('[products-by-day] WHERE clause:', whereClause);
  console.log('[products-by-day] Params:', params);

  // Query SQL otimizada com agregação direta
  const query = `
    WITH ranked_products AS (
      SELECT 
        EXTRACT(DOW FROM s.created_at)::int as day_of_week,
        ps.product_id,
        p.name as product_name,
        c.name as category_name,
        SUM(ps.quantity) as total_quantity,
        SUM(ps.total_price) as total_revenue,
        ROW_NUMBER() OVER (
          PARTITION BY EXTRACT(DOW FROM s.created_at)::int 
          ORDER BY SUM(ps.quantity) DESC
        ) as rank
      FROM product_sales ps
      JOIN sales s ON ps.sale_id = s.id
      JOIN products p ON ps.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereClause}
      GROUP BY 
        EXTRACT(DOW FROM s.created_at)::int,
        ps.product_id,
        p.name,
        c.name
    )
    SELECT 
      day_of_week,
      product_id,
      product_name,
      category_name,
      total_quantity,
      total_revenue
    FROM ranked_products
    WHERE rank <= $${params.length}
    ORDER BY day_of_week, rank
  `;

  const results: any[] = await prisma.$queryRawUnsafe(query, ...params);

  console.log('[products-by-day] Query results count:', results.length);

  const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  // Agrupar por dia da semana
  const byDay: Record<number, any[]> = {};

  results.forEach((row) => {
    const dayOfWeek = Number(row.day_of_week);
    if (!byDay[dayOfWeek]) {
      byDay[dayOfWeek] = [];
    }
    byDay[dayOfWeek].push({
      productId: Number(row.product_id),
      productName: row.product_name,
      category: row.category_name || "Sem categoria",
      quantity: Number(row.total_quantity),
      revenue: Number(row.total_revenue),
    });
  });

  // Formatar resultado
  const result = Object.entries(byDay).map(([day, products]) => ({
    dayOfWeek: parseInt(day),
    dayName: dayNames[parseInt(day)],
    products,
  }));

  return NextResponse.json(result.sort((a, b) => a.dayOfWeek - b.dayOfWeek));
});
