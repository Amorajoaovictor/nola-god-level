import { NextRequest } from 'next/server';
import { ProductService } from '@/lib/services/product.service';
import { asyncHandler } from '@/lib/middleware/error.middleware';
import { validateId } from '@/lib/middleware/validation.middleware';
import { successResponse } from '@/lib/utils/response.utils';
import { NotFoundError } from '@/lib/types/common.types';

const productService = new ProductService();

export const GET = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const id = validateId(params.id);
    const product = await productService.getProductById(id);

    if (!product) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }

    return successResponse(product);
  }
);
