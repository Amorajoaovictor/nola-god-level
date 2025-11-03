import { NextRequest } from 'next/server';
import { SaleService } from '@/lib/services/sale.service';
import { asyncHandler } from '@/lib/middleware/error.middleware';
import { successResponse } from '@/lib/utils/response.utils';

const saleService = new SaleService();

export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const storeIds = searchParams.getAll('storeId').map(id => parseInt(id));
  const channelIdStr = searchParams.get('channelId');
  const status = searchParams.get('status');
  const daysOfWeek = searchParams.getAll('daysOfWeek');

  const channelId = channelIdStr ? parseInt(channelIdStr) : undefined;
  const daysOfWeekNumbers = daysOfWeek.length > 0 ? daysOfWeek.map(d => parseInt(d)) : undefined;

  // Calcular o período atual e anterior baseado no mês
  // Usar outubro (mês passado) como "atual" e setembro como "anterior" para ter dados
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1); // Outubro
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999); // Fim de outubro
  
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 2, 1); // Setembro
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59, 999); // Fim de setembro

  // Buscar dados do mês atual
  const currentMonthSummary = await saleService.getSalesSummary(
    undefined,
    currentMonthStart,
    currentMonthEnd,
    daysOfWeekNumbers,
    storeIds.length > 0 ? storeIds : undefined
  );

  // Buscar dados do mês anterior
  const lastMonthSummary = await saleService.getSalesSummary(
    undefined,
    lastMonthStart,
    lastMonthEnd,
    daysOfWeekNumbers,
    storeIds.length > 0 ? storeIds : undefined
  );

  // Calcular variações percentuais
  const revenueChange = lastMonthSummary.totalRevenue > 0
    ? ((currentMonthSummary.totalRevenue - lastMonthSummary.totalRevenue) / lastMonthSummary.totalRevenue) * 100
    : 0;

  const salesChange = lastMonthSummary.totalSales > 0
    ? ((currentMonthSummary.totalSales - lastMonthSummary.totalSales) / lastMonthSummary.totalSales) * 100
    : 0;

  const ticketChange = lastMonthSummary.averageTicket > 0
    ? ((currentMonthSummary.averageTicket - lastMonthSummary.averageTicket) / lastMonthSummary.averageTicket) * 100
    : 0;

  return successResponse({
    currentMonth: {
      ...currentMonthSummary,
      period: {
        start: currentMonthStart,
        end: currentMonthEnd,
      },
    },
    lastMonth: {
      ...lastMonthSummary,
      period: {
        start: lastMonthStart,
        end: lastMonthEnd,
      },
    },
    changes: {
      revenue: revenueChange,
      sales: salesChange,
      ticket: ticketChange,
    },
  });
});
