import z from 'zod';

import { apiErrorCodeSchema } from './errorCodes.js';
import { responseMetaSchema } from './responseMeta.js';

export const apiErrorBodySchema = z.object({
  code: apiErrorCodeSchema,
  message: z.string().min(1),
  details: z.json().optional(),
});

export const apiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: apiErrorBodySchema,
  meta: responseMetaSchema,
});

export const validationIssueSchema = z.object({
  field: z.string().min(1),
  message: z.string().min(1),
});

export const validationIssuesSchema = z.array(validationIssueSchema);

export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;

export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;

export type ValidationIssue = z.infer<typeof validationIssueSchema>;
