import { AxiosHeaders, type AxiosInstance, type AxiosResponse } from 'axios';

import {
  apiSuccessResponseSchema,
  requestIdSchema,
  type ApiSuccessResponse,
} from '@stagegate/contracts';

import { ApiError, CLIENT_ERROR_CODES } from '../errors/apiError.js';
import { normalizeApiError } from '../errors/normalizeError.js';

import type { ApiClientOptions, ApiRequest, AuthMode, RawApiRequest } from './apiClient.types.js';
import type z from 'zod';

const RESERVED_HEADERS = new Set([
  'authorization',
  'cookie',
  'host',
  'origin',
  'content-length',
  'x-request-id',
]);

const DISALLOWED_DECODED_PATH_CHARACTERS = new Set(['\\', '/', '?', '#', '%']);

const hasUnsafeDecodedPathCharacter = (value: string): boolean => {
  for (const character of value) {
    const code = character.charCodeAt(0);

    if (DISALLOWED_DECODED_PATH_CHARACTERS.has(character) || code <= 0x1f || code === 0x7f) {
      return true;
    }
  }

  return false;
};

const validatePath = (path: string): void => {
  const segments = path.split('/');

  if (
    !/^\/[a-zA-Z0-9_~.%/-]+$/.test(path) ||
    path.startsWith('//') ||
    path.includes('//') ||
    segments.some((segment) => {
      try {
        const decoded = decodeURIComponent(segment);

        return decoded === '.' || decoded === '..' || hasUnsafeDecodedPathCharacter(decoded);
      } catch {
        return true;
      }
    })
  ) {
    throw new ApiError({
      kind: 'configuration',
      code: CLIENT_ERROR_CODES.INVALID_REQUEST,
      message: 'API requests require a safe relative path.',
    });
  }
};

const createHeaders = (values: Readonly<Record<string, string>> | undefined): AxiosHeaders => {
  const headers = new AxiosHeaders();

  for (const [name, value] of Object.entries(values ?? {})) {
    if (
      RESERVED_HEADERS.has(name.toLowerCase()) ||
      !/^[a-zA-Z0-9!#$%&'*+.^_`|~-]+$/.test(name) ||
      /[\r\n]/.test(value)
    ) {
      throw new ApiError({
        kind: 'configuration',
        code: CLIENT_ERROR_CODES.INVALID_REQUEST,
        message: 'Invalid request header.',
      });
    }

    headers.set(name, value);
  }

  return headers;
};

const throwIfCancelled = (signal: AbortSignal | undefined): void => {
  if (signal?.aborted) {
    throw new ApiError({
      kind: 'cancelled',
      code: CLIENT_ERROR_CODES.CANCELLED,
      message: 'The request was cancelled.',
    });
  }
};

const resolveToken = async (
  mode: AuthMode,
  options: ApiClientOptions,
  signal: AbortSignal | undefined,
): Promise<string | null> => {
  if (mode === 'none') {
    return null;
  }

  let token: string | null;

  try {
    token = (await options.tokenProvider?.getToken()) ?? null;
  } catch {
    throwIfCancelled(signal);

    throw new ApiError({
      kind: 'authentication',
      code: CLIENT_ERROR_CODES.AUTH_TOKEN_ERROR,
      message: 'Unable to retrieve authentication credentials.',
    });
  }

  throwIfCancelled(signal);

  if (token === null || token === '') {
    if (mode === 'required') {
      throw new ApiError({
        kind: 'authentication',
        code: CLIENT_ERROR_CODES.AUTH_REQUIRED,
        message: 'Sign in to continue.',
      });
    }

    return null;
  }

  if (/\s/.test(token)) {
    throw new ApiError({
      kind: 'authentication',

      code: CLIENT_ERROR_CODES.AUTH_TOKEN_ERROR,

      message: 'Invalid authentication credentials.',
    });
  }

  return token;
};

const notifyUnauthorized = async (error: ApiError, mode: AuthMode, options: ApiClientOptions) => {
  if (error.status !== 401 || mode === 'none' || !options.onUnauthorized) {
    return;
  }

  try {
    await options.onUnauthorized({
      requestId: error.requestId,
    });
  } catch {
    // Preserve the original request error.
    // Session recovery must not replace it.
  }
};

const getResponseRequestId = (responseMetaSchema: AxiosResponse<unknown>): string | undefined => {
  const header: unknown = responseMetaSchema.headers['x-request-id'];

  const result = requestIdSchema.safeParse(header);

  return result.success ? result.data : undefined;
};

const execute = async <TSchema extends z.ZodType>(
  client: AxiosInstance,
  request: RawApiRequest<TSchema>,
  options: ApiClientOptions,
): Promise<z.output<TSchema>> => {
  const mode = request.auth ?? 'required';

  try {
    validatePath(request.path);

    throwIfCancelled(request.signal);

    const headers = createHeaders(request.headers);

    const token = await resolveToken(mode, options, request.signal);

    throwIfCancelled(request.signal);

    if (token !== null) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await client.request<unknown>({
      method: request.method,

      url: request.path,

      headers,

      data: request.body,

      params: request.query,

      ...(request.signal ? { signal: request.signal } : {}),

      ...(request.acceptedStatuses
        ? {
            validateStatus: (status: number) => request.acceptedStatuses?.includes(status) ?? false,
          }
        : {}),
    });

    throwIfCancelled(request.signal);

    const result = request.schema.safeParse(response.data);

    if (!result.success) {
      throw new ApiError({
        kind: 'contract',

        code: CLIENT_ERROR_CODES.INVALID_RESPONSE,

        message: 'The server returned an unexpected response.',

        status: response.status,

        requestId: getResponseRequestId(response),

        details: result.error.issues.map((issue) => ({
          path: issue.path.map(String).join('.'),

          code: issue.code,
        })),
      });
    }
    return result.data;
  } catch (error) {
    const normalized = normalizeApiError(error);

    await notifyUnauthorized(normalized, mode, options);

    throw normalized;
  }
};

export const executeApiRequest = <TSchema extends z.ZodType>(
  client: AxiosInstance,
  request: ApiRequest<TSchema>,
  options: ApiClientOptions,
): Promise<ApiSuccessResponse<z.output<TSchema>>> => {
  const responseSchema = apiSuccessResponseSchema(request.schema) as unknown as z.ZodType<
    ApiSuccessResponse<z.output<TSchema>>
  >;

  return execute(
    client,
    {
      ...request,

      schema: responseSchema,
    },
    options,
  );
};

export const executeRawRequest = async <TSchema extends z.ZodType>(
  client: AxiosInstance,
  request: RawApiRequest<TSchema>,
  options: ApiClientOptions,
): Promise<z.output<TSchema>> => execute(client, request, options);
