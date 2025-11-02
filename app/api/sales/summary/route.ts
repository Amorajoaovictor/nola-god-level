import { NextRequest } from 'next/server';
import { SaleService } from '@/lib/services/sale.service';
import { asyncHandler } from '@/lib/middleware/error.middleware';
import { successResponse } from '@/lib/utils/response.utils';

const saleService = new SaleService();

export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const storeIdStr = searchParams.get('storeId');
  const channelIdStr = searchParams.get('channelId');
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');
  const status = searchParams.get('status');
  const daysOfWeek = searchParams.getAll('daysOfWeek');

  const storeId = storeIdStr ? parseInt(storeIdStr) : undefined;
  const startDate = startDateStr ? new Date(startDateStr) : undefined;
  const endDate = endDateStr ? new Date(endDateStr) : undefined;
  const daysOfWeekNumbers = daysOfWeek.length > 0 ? daysOfWeek.map(d => parseInt(d)) : undefined;

  const summary = await saleService.getSalesSummary(storeId, startDate, endDate, daysOfWeekNumbers);

  return successResponse(summary);
});
