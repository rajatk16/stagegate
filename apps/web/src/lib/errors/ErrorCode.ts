export const ErrorCode = {
  Unknown: 'UNKNOWN',
  Network: 'NETWORK',
  Timeout: 'TIMEOUT',
  Cancelled: 'CANCELLED',
  Unauthorized: 'UNAUTHORIZED',
  Forbidden: 'FORBIDDEN',
  NotFound: 'NOT_FOUND',
  Conflict: 'CONFLICT',
  Validation: 'VALIDATION',
  Internal: 'INTERNAL',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
