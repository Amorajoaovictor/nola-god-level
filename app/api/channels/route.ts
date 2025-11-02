import { NextRequest } from 'next/server';
import { asyncHandler } from '@/lib/middleware/error.middleware';
import { successResponse } from '@/lib/utils/response.utils';
import prisma from '@/lib/prisma/client';

/**
 * GET /api/channels
 * Get all channels
 */
export const GET = asyncHandler(async (req: NextRequest) => {
  const channels = await prisma.channel.findMany({
    orderBy: { name: 'asc' },
  });

  return successResponse(channels);
});
