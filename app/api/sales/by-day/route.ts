import { NextRequest } from 'next/server';
import { asyncHandler } from '@/lib/middleware/error.middleware';
import { successResponse } from '@/lib/utils/response.utils';
import prisma from '@/lib/prisma/client';

/**
 * @swagger
 * /api/sales/by-day:
 *   get:
 *     summary: Obter vendas agrupadas por dia
 *     description: Retorna vendas agregadas por dia com filtros opcionais
 *     tags: [Sales]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Número de dias retroativos (padrão 30)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final (YYYY-MM-DD)
 *       - in: query
 *         name: storeId
 *         schema:
 *           type: array
 *           items:
 *             type: integer
 *         description: IDs das lojas (pode ser múltiplo)
 *       - in: query
 *         name: channelId
 *         schema:
 *           type: integer
 *         description: ID do canal de venda
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Status da venda
 *       - in: query
 *         name: dayOfWeek
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 6
 *         description: Dia da semana (0=Domingo, 6=Sábado)
 *     responses:
 *       200:
 *         description: Lista de vendas agrupadas por dia
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2025-11-01"
 *                       totalSales:
 *                         type: integer
 *                         example: 150
 *                       totalRevenue:
 *                         type: number
 *                         format: float
 *                         example: 45000.50
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days') || '30');
  const storeIds = searchParams.getAll('storeId').map(id => parseInt(id));
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

  if (storeIds.length > 0) {
    conditions.push(`store_id = ANY($${paramIndex})`);
    params.push(storeIds);
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
