import { NextResponse } from 'next/server';
import { ApiResponse, PaginatedResponse } from '@/lib/types/common.types';

/**
 * Create successful API response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status = 200
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
  };

  return NextResponse.json(response, { status });
}

/**
 * Create paginated API response
 */
export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  status = 200
): NextResponse {
  const response: PaginatedResponse<T> = {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };

  return NextResponse.json(
    {
      success: true,
      ...response,
    },
    { status }
  );
}

/**
 * Create error API response
 */
export function errorResponse(
  error: string,
  status = 500
): NextResponse {
  const response: ApiResponse<null> = {
    success: false,
    error,
  };

  return NextResponse.json(response, { status });
}
