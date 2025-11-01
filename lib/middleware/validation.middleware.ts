import { NextRequest } from 'next/server';
import { ValidationError } from '@/lib/types/common.types';

/**
 * Validate pagination parameters
 */
export function validatePagination(searchParams: URLSearchParams): {
  page: number;
  limit: number;
} {
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');

  if (page < 1) {
    throw new ValidationError('Page must be greater than 0');
  }

  if (limit < 1 || limit > 100) {
    throw new ValidationError('Limit must be between 1 and 100');
  }

  return { page, limit };
}

/**
 * Validate date range parameters
 */
export function validateDateRange(searchParams: URLSearchParams): {
  startDate?: Date;
  endDate?: Date;
} {
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');

  if (!startDateStr && !endDateStr) {
    return {};
  }

  if (!startDateStr || !endDateStr) {
    throw new ValidationError('Both startDate and endDate must be provided');
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new ValidationError('Invalid date format. Use ISO 8601 format');
  }

  if (startDate > endDate) {
    throw new ValidationError('startDate must be before endDate');
  }

  return { startDate, endDate };
}

/**
 * Validate ID parameter
 */
export function validateId(id: string): number {
  const numId = parseInt(id);
  if (isNaN(numId) || numId < 1) {
    throw new ValidationError('Invalid ID format');
  }
  return numId;
}

/**
 * Validate required fields
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): void {
  const missingFields = requiredFields.filter((field) => !data[field]);
  
  if (missingFields.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missingFields.join(', ')}`
    );
  }
}
