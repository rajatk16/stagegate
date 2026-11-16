export { StageGateApiClient, createApiClient } from './core/apiClient.js';

export { ApiError, CLIENT_ERROR_CODES, isApiError } from './errors/apiError.js';

export { normalizeApiError } from './errors/normalizeError.js';

export { HealthApi } from './resources/health.api.js';

export type {
  ApiClientOptions,
  ApiRequest,
  AuthMode,
  AuthTokenProvider,
  HttpMethod,
  QueryParameters,
  RequestOptions,
  UnauthorizedContext,
} from './core/apiClient.types.js';

export type { ApiErrorKind, ApiErrorOptions, ClientErrorCode } from './errors/apiError.js';

export type { HealthRequestOptions, HealthResponse } from './resources/health.api.js';
