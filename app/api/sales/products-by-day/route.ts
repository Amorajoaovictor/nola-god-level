import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "@/lib/middleware/error.middleware";
import prisma from "@/lib/prisma/client";

/**
 * GET /api/sales/products-by-day
 * Retorna produtos mais populares por dia da semana
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  
  const storeIds = searchParams.getAll("storeId").map(Number);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const limit = parseInt(searchParams.get("limit") || "5");

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
      WHERE 1=1 
        ${dateFilter}
        ${storeFilter}
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
    WHERE rank <= ${limit}
    ORDER BY day_of_week, rank
  `;

  const results: any[] = await prisma.$queryRawUnsafe(query);

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
