import z from 'zod';

import { apiErrorResponseSchema, type ApiErrorResponse } from './errorResponse.js';
import { apiSuccessResponseSchema, type ApiSuccessResponse } from './successResponse.js';

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export const apiResponseSchema = <TSchema extends z.ZodType>(dataSchema: TSchema) =>
  z.discriminatedUnion('success', [apiSuccessResponseSchema(dataSchema), apiErrorResponseSchema]);
