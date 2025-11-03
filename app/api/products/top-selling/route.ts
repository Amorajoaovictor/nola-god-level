import { NextRequest } from 'next/server';
import { ProductService } from '@/lib/services/product.service';
import { asyncHandler } from '@/lib/middleware/error.middleware';
import { successResponse } from '@/lib/utils/response.utils';

const productService = new ProductService();

/**
 * @swagger
 * /api/products/top-selling:
 *   get:
 *     summary: Obter produtos mais vendidos
 *     description: Retorna ranking dos produtos mais vendidos com filtros opcionais
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de produtos a retornar
 *       - in: query
 *         name: storeId
 *         schema:
 *           type: integer
 *         description: Filtrar por loja específica
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
 *     responses:
 *       200:
 *         description: Lista de produtos mais vendidos
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
 *                       product:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           category:
 *                             type: string
 *                       totalQuantity:
 *                         type: integer
 *                         example: 500
 *                       totalRevenue:
 *                         type: number
 *                         format: float
 *                         example: 25000.00
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const limitStr = searchParams.get('limit');
  const limit = limitStr ? parseInt(limitStr) : 10;
  const storeIdStr = searchParams.get('storeId');
  const storeId = storeIdStr ? parseInt(storeIdStr) : undefined;
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const topProducts = await productService.getTopSellingProducts(
    limit,
    startDate || undefined,
    endDate || undefined,
    storeId
  );

  return successResponse(topProducts);
});
