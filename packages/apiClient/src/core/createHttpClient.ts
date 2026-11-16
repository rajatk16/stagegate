import axios, { AxiosHeaders } from 'axios';

import { requestIdSchema } from '@stagegate/contracts';

import { ApiError, CLIENT_ERROR_CODES } from '../errors/apiError.js';

import type { ApiClientOptions } from './apiClient.types.js';
import type { AxiosInstance } from 'axios';

export interface HttpClients {
  api: AxiosInstance;
  origin: AxiosInstance;
}

export const normalizeBaseUrl = (value: string): URL => {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new ApiError({
      kind: 'configuration',
      code: CLIENT_ERROR_CODES.INVALID_REQUEST,
      message: 'Invalid API base URL.',
    });
  }

  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username !== '' ||
    url.password !== '' ||
    url.search !== '' ||
    url.hash !== '' ||
    !/\/api\/v1\/?$/.test(url.pathname)
  ) {
    throw new ApiError({
      kind: 'configuration',
      code: CLIENT_ERROR_CODES.INVALID_REQUEST,
      message: 'API base URL be an HTTP(S) URL ending in /api/v1',
    });
  }

  url.pathname = url.pathname.replace(/\/+$/, '');

  return url;
};

const createRequestId = (): string => globalThis.crypto.randomUUID();

const createHttpClient = (baseURL: string, options: ApiClientOptions): AxiosInstance => {
  const timeout = options.timeoutMs ?? 15_000;

  if (!Number.isSafeInteger(timeout) || timeout < 100 || timeout > 120_000) {
    throw new ApiError({
      kind: 'configuration',
      code: CLIENT_ERROR_CODES.INVALID_REQUEST,
      message: 'Invalid HTTP timeout.',
    });
  }

  const client = axios.create({
    baseURL,
    timeout,
    withCredentials: false,
    allowAbsoluteUrls: false,
    maxRedirects: 0,
    headers: {
      Accept: 'application/json',
    },
    transitional: {
      clarifyTimeoutError: true,
    },
  });

  client.interceptors.request.use((configuration) => {
    const headers = AxiosHeaders.from(configuration.headers);

    const requestId = options.requestIdFactory?.() ?? createRequestId();

    const parsed = requestIdSchema.safeParse(requestId);

    if (!parsed.success) {
      throw new ApiError({
        kind: 'configuration',
        code: CLIENT_ERROR_CODES.INVALID_REQUEST,
        message: 'Invalid request identifier.',
      });
    }

    headers.set('X-Request-Id', parsed.data);

    configuration.headers = headers;

    return configuration;
  });

  return client;
};

export const createHttpClients = (options: ApiClientOptions): HttpClients => {
  const baseUrl = normalizeBaseUrl(options.baseUrl);

  return {
    api: createHttpClient(baseUrl.toString(), options),
    origin: createHttpClient(baseUrl.origin, options),
  };
};
