import z from 'zod';

import { requestIdSchema, timestampSchema } from '../common/identifiers.js';

export const responseMetaSchema = z.object({
  requestId: requestIdSchema,
  timestamp: timestampSchema,
});

export type ResponseMeta = z.infer<typeof responseMetaSchema>;
