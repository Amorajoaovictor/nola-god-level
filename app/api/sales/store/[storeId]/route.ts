import { NextRequest } from 'next/server';
import { SaleService } from '@/lib/services/sale.service';
import { asyncHandler } from '@/lib/middleware/error.middleware';
import { validateId, validatePagination } from '@/lib/middleware/validation.middleware';
import { paginatedResponse } from '@/lib/utils/response.utils';

const saleService = new SaleService();

export const GET = asyncHandler(
  async (req: NextRequest, { params }: { params: { storeId: string } }) => {
    const storeId = validateId(params.storeId);
    const { searchParams } = new URL(req.url);
    const { page, limit } = validatePagination(searchParams);

    const sales = await saleService.getSalesByStore(storeId, page, limit);
    const total = await saleService.getStoreTotalSales(storeId);

    return paginatedResponse(sales, page, limit, total);
  }
);
