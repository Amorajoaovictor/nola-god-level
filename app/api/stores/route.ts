import { NextRequest } from 'next/server';
import { StoreService } from '@/lib/services/store.service';
import { asyncHandler } from '@/lib/middleware/error.middleware';
import { validatePagination } from '@/lib/middleware/validation.middleware';
import { paginatedResponse, successResponse } from '@/lib/utils/response.utils';

const storeService = new StoreService();

/**
 * @swagger
 * /api/stores:
 *   get:
 *     summary: Obter lista de lojas
 *     description: Retorna lista paginada de lojas ou apenas lojas ativas
 *     tags: [Stores]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Retornar apenas lojas ativas (se true, ignora paginação)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Itens por página
 *     responses:
 *       200:
 *         description: Lista de lojas
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   description: Resposta paginada (quando active não é true)
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Store'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                 - type: object
 *                   description: Resposta simples (quando active=true)
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Store'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const active = searchParams.get('active');

  if (active === 'true') {
    const stores = await storeService.getActiveStores();
    return successResponse(stores);
  }

  const { page, limit } = validatePagination(searchParams);
  const result = await storeService.getAllStores(page, limit);

  return paginatedResponse(result.data, page, limit, result.total);
});
