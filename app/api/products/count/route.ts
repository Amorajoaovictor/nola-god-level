import { NextRequest } from 'next/server';
import { asyncHandler } from '@/lib/middleware/error.middleware';
import { successResponse } from '@/lib/utils/response.utils';
import prisma from '@/lib/prisma/client';

/**
 * GET /api/products/count
 * Get total count of products (with optional filters)
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const storeIdStr = searchParams.get('storeId');
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');

  // Se houver filtros de loja/data, contar produtos que tiveram vendas nesse filtro
  if (storeIdStr || startDateStr || endDateStr) {
    const whereClause: any = {};
    
    // Construir filtro para o relacionamento sale
    whereClause.sale = {};
    
    if (storeIdStr) {
      whereClause.sale.storeId = parseInt(storeIdStr);
    }
    
    if (startDateStr || endDateStr) {
      whereClause.sale.createdAt = {};
      if (startDateStr) {
        whereClause.sale.createdAt.gte = new Date(startDateStr);
      }
      if (endDateStr) {
        const endDateTime = new Date(endDateStr);
        endDateTime.setHours(23, 59, 59, 999);
        whereClause.sale.createdAt.lte = endDateTime;
      }
    }

    // Contar produtos únicos que tiveram vendas com os filtros aplicados
    const productSales = await prisma.productSale.findMany({
      where: whereClause,
      select: {
        productId: true,
      },
      distinct: ['productId'],
    });

    return successResponse({ total: productSales.length });
  }

  // Sem filtros, retornar total de produtos cadastrados
  const totalProducts = await prisma.product.count({
    where: {
      deletedAt: null,
    },
  });

  return successResponse({ total: totalProducts });
});
