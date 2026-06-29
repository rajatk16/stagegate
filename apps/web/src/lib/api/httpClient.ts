import { parseError } from '../errors';
import { apiClient } from './apiClient';
import type { RequestOptions } from './types';
import { buildConfig, extractData } from './utils';

class HttpClient {
  async get<T>(url: string, options?: RequestOptions): Promise<T> {
    try {
      const response = await apiClient.get<T>(url, buildConfig(options));
      return extractData(response);
    } catch (error) {
      throw parseError(error);
    }
  }

  async post<TResponse, TBody>(
    url: string,
    body: TBody,
    options?: RequestOptions,
  ): Promise<TResponse> {
    try {
      const response = await apiClient.post<TResponse>(
        url,
        body,
        buildConfig(options),
      );

      return extractData(response);
    } catch (error) {
      throw parseError(error);
    }
  }

  async put<TResponse, TBody>(
    url: string,
    body: TBody,
    options?: RequestOptions,
  ): Promise<TResponse> {
    try {
      const response = await apiClient.put<TResponse>(
        url,
        body,
        buildConfig(options),
      );

      return extractData(response);
    } catch (error) {
      throw parseError(error);
    }
  }

  async patch<TResponse, TBody>(
    url: string,
    body: TBody,
    options?: RequestOptions,
  ): Promise<TResponse> {
    try {
      const response = await apiClient.patch<TResponse>(
        url,
        body,
        buildConfig(options),
      );

      return extractData(response);
    } catch (error) {
      throw parseError(error);
    }
  }

  async delete<TResponse>(
    url: string,
    options?: RequestOptions,
  ): Promise<TResponse> {
    try {
      const response = await apiClient.delete<TResponse>(
        url,
        buildConfig(options),
      );

      return extractData(response);
    } catch (error) {
      throw parseError(error);
    }
  }
}

export const httpClient = new HttpClient();
