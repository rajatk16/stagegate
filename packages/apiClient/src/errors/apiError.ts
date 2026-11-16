import type { ApiErrorCode } from '@stagegate/contracts';

export const CLIENT_ERROR_CODES = {
  NETWORK_ERROR: 'CLIENT_NETWORK_ERROR',

  TIMEOUT: 'CLIENT_TIMEOUT',

  CANCELLED: 'CLIENT_CANCELLED',

  INVALID_RESPONSE: 'CLIENT_INVALID_RESPONSE',

  AUTH_REQUIRED: 'CLIENT_AUTH_REQUIRED',

  AUTH_TOKEN_ERROR: 'CLIENT_AUTH_TOKEN_ERROR',

  INVALID_REQUEST: 'CLIENT_INVALID_REQUEST',

  UNKNOWN_ERROR: 'CLIENT_UNKNOWN_ERROR',
};

export type ClientErrorCode = (typeof CLIENT_ERROR_CODES)[keyof typeof CLIENT_ERROR_CODES];

export type ApiErrorKind =
  | 'http'
  | 'network'
  | 'timeout'
  | 'cancelled'
  | 'contract'
  | 'authentication'
  | 'configuration'
  | 'unknown';

export interface ApiErrorOptions {
  kind: ApiErrorKind;

  code: ApiErrorCode;

  message: string;

  status?: number | undefined;

  requestId?: string | undefined;

  details?: unknown;

  retryAfterMs?: number | undefined;
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;

  readonly code: ApiErrorCode;

  readonly status: number | undefined;

  readonly requestId: string | undefined;

  readonly details: unknown;

  readonly retryAfterMs: number | undefined;

  constructor(options: ApiErrorOptions) {
    super(options.message);

    this.name = 'ApiError';

    this.kind = options.kind;

    this.code = options.code;

    this.status = options.status;

    this.requestId = options.requestId;

    this.details = options.details;

    this.retryAfterMs = options.retryAfterMs;
  }

  get isUnauthorized(): boolean {
    return this.status === 401 || this.code === CLIENT_ERROR_CODES.AUTH_REQUIRED;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isCancelled(): boolean {
    return this.kind === 'cancelled';
  }

  get isValidationError(): boolean {
    return this.code === 'VALIDATION_ERROR';
  }

  get isRetryable(): boolean {
    if (this.kind === 'network' || this.kind === 'timeout') {
      return true;
    }

    return (
      this.kind === 'http' &&
      this.status !== undefined &&
      [408, 429, 500, 502, 503, 504].includes(this.status)
    );
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;
