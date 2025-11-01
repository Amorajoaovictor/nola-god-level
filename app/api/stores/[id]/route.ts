import { NextRequest } from 'next/server';
import { StoreService } from '@/lib/services/store.service';
import { asyncHandler } from '@/lib/middleware/error.middleware';
import { validateId } from '@/lib/middleware/validation.middleware';
import { successResponse } from '@/lib/utils/response.utils';
import { NotFoundError } from '@/lib/types/common.types';

const storeService = new StoreService();

export const GET = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const id = validateId(params.id);
    const store = await storeService.getStoreById(id);

    if (!store) {
      throw new NotFoundError(`Store with ID ${id} not found`);
    }

    return successResponse(store);
  }
);
