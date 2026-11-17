import { apiErrorResponseSchema } from '@stagegate/contracts';

import type { ApiErrorResponse } from '@stagegate/contracts';

export interface CreateErrorResponseOptions {
  code: string;
  message: string;
  requestId: string;
  details?: unknown;
}

export const createErrorResponse = (options: CreateErrorResponseOptions): ApiErrorResponse => {
  const baseResponse = {
    success: false,
    error: {
      code: options.code,
      message: options.message,
    },
    meta: {
      requestId: options.requestId,
      timestamp: new Date().toISOString(),
    },
  };

  if (options.details === undefined) {
    return apiErrorResponseSchema.parse(baseResponse);
  }

  const detailedResponse = apiErrorResponseSchema.safeParse({
    ...baseResponse,
    error: {
      ...baseResponse.error,
      details: options.details,
    },
  });

  if (detailedResponse.success) {
    return detailedResponse.data;
  }

  return apiErrorResponseSchema.parse(baseResponse);
};
