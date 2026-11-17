import z from 'zod';

import { timestampSchema } from '../common/identifiers.js';

export const healthStatusSchema = z.enum(['ok', 'unavailable']);

export const healthResponseSchema = z.object({
  status: healthStatusSchema,
  timestamp: timestampSchema,
});

export const HEALTH_ENDPOINTS = {
  LIVENESS: '/health/live',
  READINESS: '/health/ready',
};

export type HealthStatus = z.infer<typeof healthStatusSchema>;

export type HealthResponse = z.infer<typeof healthResponseSchema>;
