import z from 'zod';

import { responseMetaSchema, type ResponseMeta } from './responseMeta.js';

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: ResponseMeta;
}

export const apiSuccessResponseSchema = <TSchema extends z.ZodType>(dataSchema: TSchema) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: responseMetaSchema,
  });
