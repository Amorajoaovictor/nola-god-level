import { NextRequest } from 'next/server';
import { CustomerService } from '@/lib/services/customer.service';
import { asyncHandler } from '@/lib/middleware/error.middleware';
import { validateId } from '@/lib/middleware/validation.middleware';
import { successResponse } from '@/lib/utils/response.utils';
import { NotFoundError } from '@/lib/types/common.types';

const customerService = new CustomerService();

export const GET = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const id = validateId(params.id);
    const profile = await customerService.getCustomerProfile(id);

    if (!profile) {
      throw new NotFoundError(`Customer with ID ${id} not found`);
    }

    return successResponse(profile);
  }
);
