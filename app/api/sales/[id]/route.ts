import { NextRequest } from 'next/server';
import { SaleService } from '@/lib/services/sale.service';
import { asyncHandler } from '@/lib/middleware/error.middleware';
import { validateId } from '@/lib/middleware/validation.middleware';
import { successResponse } from '@/lib/utils/response.utils';
import { NotFoundError } from '@/lib/types/common.types';

const saleService = new SaleService();

export const GET = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const id = validateId(params.id);
    const sale = await saleService.getSaleById(id);

    if (!sale) {
      throw new NotFoundError(`Sale with ID ${id} not found`);
    }

    return successResponse(sale);
  }
);
