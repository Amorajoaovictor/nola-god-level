import { NextRequest } from 'next/server';
import { SaleService } from '@/lib/services/sale.service';
import { asyncHandler } from '@/lib/middleware/error.middleware';
import { successResponse } from '@/lib/utils/response.utils';

const saleService = new SaleService();

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
