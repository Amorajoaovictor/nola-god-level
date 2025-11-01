import { NextRequest } from 'next/server';
import { StoreService } from '@/lib/services/store.service';
import { asyncHandler } from '@/lib/middleware/error.middleware';
import { validateId } from '@/lib/middleware/validation.middleware';
import { successResponse } from '@/lib/utils/response.utils';

const storeService = new StoreService();

export const GET = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const id = validateId(params.id);
    const { searchParams } = new URL(req.url);
    
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    const performance = await storeService.getStorePerformance(id, startDate, endDate);

    return successResponse(performance);
  }
);
