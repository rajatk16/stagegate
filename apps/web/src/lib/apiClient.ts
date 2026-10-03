const configuredBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.trim() || '/api/v1';

export const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, '');

type ApiErrorKind = 'http' | 'network' | 'timeout' | 'response';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | undefined;
  readonly code: string | undefined;

  constructor(
    message: string,
    kind: ApiErrorKind,
    status?: number,
    code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.code = code;
  }
}

export type ApiRequestOptions = Omit<RequestInit, 'body' | 'method'> & {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  json?: unknown;
  timeoutMs?: number;
  formData?: FormData;
  responseType?: 'json' | 'blob';
};

export const apiRequest = async (
  path: string,
  options: ApiRequestOptions = {},
): Promise<unknown> => {
  const {
    json,
    timeoutMs = 8_000,
    signal: callerSignal,
    headers: customHeaders,
    method = 'GET',
    formData,
    responseType = 'json',
    ...requestOptions
  } = options;

  if (json !== undefined && formData !== undefined) {
    throw new Error('Provide JSON or FormData, not both');
  }

  if (method === 'GET' && (json !== undefined || formData !== undefined)) {
    throw new Error('GET requests cannot include a body.');
  }

  const url = `${API_BASE_URL}/${path.replace(/^\/+/, '')}`;
  const headers = new Headers(customHeaders);

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  const body =
    formData ?? (json === undefined ? undefined : JSON.stringify(json));

  if (json !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (formData !== undefined) {
    headers.delete('Content-Type');
  }

  if (body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const signal = callerSignal
    ? AbortSignal.any([callerSignal, timeoutSignal])
    : timeoutSignal;

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      ...requestOptions,
      method,
      headers,
      body,
      signal,
    });

    if (!response.ok) {
      let code: string | undefined;

      try {
        const payload: unknown = await response.json();

        if (
          typeof payload === 'object' &&
          payload !== null &&
          !Array.isArray(payload) &&
          'code' in payload &&
          typeof payload.code === 'string'
        ) {
          code = payload.code;
        }
      } catch {
        // An error response can be empty or contain non-JSON content.
        // Preserve its HTTP status even when the body cannot be parsed.
      }

      const message =
        response.status === 502
          ? 'The gateway could not reach the API. Check that the backend is running.'
          : `The API returned HTTP ${response.status}.`;

      throw new ApiError(message, 'http', response.status, code);
    }

    if (response.status === 204) {
      return undefined;
    }

    if (responseType === 'blob') {
      return await response.blob();
    }

    const text = await response.text();

    if (!text.trim()) {
      return undefined;
    }

    try {
      const data: unknown = JSON.parse(text);
      return data;
    } catch {
      throw new ApiError(
        'The API returned invalid JSON.',
        'response',
        response.status,
      );
    }
  } catch (error: unknown) {
    if (callerSignal?.aborted) {
      throw error;
    }

    if (timeoutSignal.aborted) {
      throw new ApiError(
        `The API did not response within ${timeoutMs / 1000} seconds.`,
        'timeout',
      );
    }

    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError) {
      throw new ApiError(
        'Could not reach the API. Check your connection and the server.',
        'network',
      );
    }

    throw error;
  }
};
