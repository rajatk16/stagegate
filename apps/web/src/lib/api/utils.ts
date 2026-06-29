import type { AxiosResponse } from 'axios';

import type { RequestOptions } from './types';

export const buildConfig = (options?: RequestOptions) => ({
  params: options?.params,
  signal: options?.signal,
  headers: options?.headers,
  timeout: options?.timeout,
});

export const extractData = <T>(response: AxiosResponse<T>): T => response.data;
