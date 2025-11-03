import { NextRequest } from 'next/server';
import { SaleService } from '@/lib/services/sale.service';
import { asyncHandler } from '@/lib/middleware/error.middleware';
import { successResponse } from '@/lib/utils/response.utils';

const saleService = new SaleService();

/**
 * @swagger
 * /api/sales/summary:
 *   get:
 *     summary: Obter resumo de vendas
 *     description: Retorna métricas agregadas de vendas (total, receita, ticket médio, etc)
 *     tags: [Sales]
 *     parameters:
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
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial do período
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final do período
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Status da venda
 *       - in: query
 *         name: daysOfWeek
 *         schema:
 *           type: array
 *           items:
 *             type: integer
 *             minimum: 0
 *             maximum: 6
 *         description: Dias da semana (0=Domingo, 6=Sábado)
 *     responses:
 *       200:
 *         description: Resumo de vendas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalSales:
 *                       type: integer
 *                       example: 1500
 *                     totalRevenue:
 *                       type: number
 *                       format: float
 *                       example: 450000.00
 *                     averageTicket:
 *                       type: number
 *                       format: float
 *                       example: 300.00
 *                     uniqueProducts:
 *                       type: integer
 *                       example: 75
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const storeIds = searchParams.getAll('storeId').map(id => parseInt(id));
  const channelIdStr = searchParams.get('channelId');
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');
  const status = searchParams.get('status');
  const daysOfWeek = searchParams.getAll('daysOfWeek');

  const storeId = storeIds.length === 1 ? storeIds[0] : undefined;
  const startDate = startDateStr ? new Date(startDateStr) : undefined;
  const endDate = endDateStr ? new Date(endDateStr) : undefined;
  const daysOfWeekNumbers = daysOfWeek.length > 0 ? daysOfWeek.map(d => parseInt(d)) : undefined;

  const summary = await saleService.getSalesSummary(storeId, startDate, endDate, daysOfWeekNumbers, storeIds.length > 0 ? storeIds : undefined);

  return successResponse(summary);
});
