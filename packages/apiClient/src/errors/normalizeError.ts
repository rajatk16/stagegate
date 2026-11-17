import axios from 'axios';

import { API_ERROR_CODES, apiErrorResponseSchema, requestIdSchema } from '@stagegate/contracts';

import { ApiError, CLIENT_ERROR_CODES, isApiError } from './apiError.js';

import type { AxiosError } from 'axios';

const STATUS_CODES: Readonly<Record<number, string>> = {
  400: API_ERROR_CODES.BAD_REQUEST,

  401: API_ERROR_CODES.UNAUTHORIZED,

  403: API_ERROR_CODES.FORBIDDEN,

  404: API_ERROR_CODES.NOT_FOUND,

  405: API_ERROR_CODES.METHOD_NOT_ALLOWED,

  409: API_ERROR_CODES.CONFLICT,

  413: API_ERROR_CODES.PAYLOAD_TOO_LARGE,

  415: API_ERROR_CODES.UNSUPPORTED_MEDIA_TYPE,

  422: API_ERROR_CODES.UNPROCESSABLE_ENTITY,

  429: API_ERROR_CODES.TOO_MANY_REQUESTS,

  500: API_ERROR_CODES.INTERNAL_SERVER_ERROR,

  501: API_ERROR_CODES.NOT_IMPLEMENTED,

  502: API_ERROR_CODES.BAD_GATEWAY,

  503: API_ERROR_CODES.SERVICE_UNAVAILABLE,

  504: API_ERROR_CODES.GATEWAY_TIMEOUT,
};

const readRequestId = (error: AxiosError): string | undefined => {
  const header: unknown = error.response?.headers['x-request-id'];

  const result = requestIdSchema.safeParse(header);

  return result.success ? result.data : undefined;
};

const readRetryAfter = (error: AxiosError): number | undefined => {
  const header: unknown = error.response?.headers['retry-after'];

  if (typeof header !== 'string') {
    return undefined;
  }

  if (/^\d+$/.test(header)) {
    const seconds = Number(header);

    return Number.isSafeInteger(seconds) && seconds <= Number.MAX_SAFE_INTEGER / 1000
      ? seconds * 1000
      : undefined;
  }

  const timestamp = Date.parse(header);

  return Number.isFinite(timestamp) ? Math.max(0, timestamp - Date.now()) : undefined;
};

const normalizeHttpError = (error: AxiosError): ApiError => {
  const status = error.response?.status;

  const response = apiErrorResponseSchema.safeParse(error.response?.data);

  if (response.success) {
    return new ApiError({
      kind: 'http',

      code: response.data.error.code,

      message: response.data.error.message,

      status,

      requestId: response.data.meta.requestId,

      details: response.data.error.details,

      retryAfterMs: readRetryAfter(error),
    });
  }

  return new ApiError({
    kind: 'http',

    code: STATUS_CODES[status ?? 0] ?? 'HTTP_ERROR',

    message: 'The server could not complete the request.',

    status,

    requestId: readRequestId(error),

    retryAfterMs: readRetryAfter(error),
  });
};

export const normalizeApiError = (error: unknown): ApiError => {
  if (isApiError(error)) {
    return error;
  }

  if (axios.isCancel(error) || (error instanceof Error && error.name === 'AbortError')) {
    return new ApiError({
      kind: 'cancelled',

      code: CLIENT_ERROR_CODES.CANCELLED,

      message: 'The request was cancelled.',
    });
  }

  if (axios.isAxiosError<unknown>(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new ApiError({
        kind: 'timeout',

        code: CLIENT_ERROR_CODES.TIMEOUT,

        message: 'The request timed out.',
      });
    }

    if (error.response) {
      return normalizeHttpError(error);
    }

    if (error.code === 'ERR_NETWORK' || error.request) {
      return new ApiError({
        kind: 'network',

        code: CLIENT_ERROR_CODES.NETWORK_ERROR,

        message: 'Unable to connect to StageGate.',
      });
    }
  }

  return new ApiError({
    kind: 'unknown',

    code: CLIENT_ERROR_CODES.UNKNOWN_ERROR,

    message: 'An unexpected request error occurred.',
  });
};
