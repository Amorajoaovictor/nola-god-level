import { NextRequest } from 'next/server';
import { asyncHandler } from '@/lib/middleware/error.middleware';
import { successResponse } from '@/lib/utils/response.utils';
import prisma from '@/lib/prisma/client';

/**
 * GET /api/customers/stats
 * Get customer statistics
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  const [total, withEmail, withPhone, promotionsEmail, promotionsSms] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.count({
      where: {
        email: { not: null },
      },
    }),
    prisma.customer.count({
      where: {
        phoneNumber: { not: null },
      },
    }),
    prisma.customer.count({
      where: {
        receivePromotionsEmail: true,
      },
    }),
    prisma.customer.count({
      where: {
        receivePromotionsSms: true,
      },
    }),
  ]);

  return successResponse({
    total,
    withEmail,
    withPhone,
    promotionsEmail,
    promotionsSms,
  });
});
