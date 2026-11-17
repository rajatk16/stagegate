import { HealthApi } from '../resources/health.api.js';

import { createHttpClients } from './createHttpClient.js';
import { executeApiRequest } from './request.js';

import type { ApiClientOptions, ApiRequest, RequestOptions } from './apiClient.types.js';
import type { ApiSuccessResponse } from '@stagegate/contracts';
import type { AxiosInstance } from 'axios';
import type z from 'zod';

export class StageGateApiClient {
  private readonly http: AxiosInstance;

  private readonly options: ApiClientOptions;

  readonly health: HealthApi;

  constructor(options: ApiClientOptions) {
    this.options = { ...options };

    const clients = createHttpClients(this.options);

    this.http = clients.api;

    this.health = new HealthApi(clients.origin, this.options);
  }

  request<TSchema extends z.ZodType>(
    request: ApiRequest<TSchema>,
  ): Promise<ApiSuccessResponse<z.output<TSchema>>> {
    return executeApiRequest(this.http, request, this.options);
  }

  async get<TSchema extends z.ZodType>(
    path: string,
    schema: TSchema,
    options: RequestOptions = {},
  ): Promise<z.output<TSchema>> {
    const response = await this.request({
      ...options,
      method: 'GET',
      path,
      schema,
    });

    return response.data;
  }

  async post<TSchema extends z.ZodType>(
    path: string,
    body: unknown,
    schema: TSchema,
    options: RequestOptions = {},
  ): Promise<z.output<TSchema>> {
    const response = await this.request({
      ...options,
      method: 'POST',
      path,
      body,
      schema,
    });

    return response.data;
  }

  async put<TSchema extends z.ZodType>(
    path: string,
    body: unknown,
    schema: TSchema,
    options: RequestOptions = {},
  ): Promise<z.output<TSchema>> {
    const response = await this.request({
      ...options,
      method: 'PUT',
      path,
      body,
      schema,
    });

    return response.data;
  }

  async patch<TSchema extends z.ZodType>(
    path: string,
    body: unknown,
    schema: TSchema,
    options: RequestOptions = {},
  ): Promise<z.output<TSchema>> {
    const response = await this.request({
      ...options,
      method: 'PATCH',
      path,
      body,
      schema,
    });

    return response.data;
  }

  async delete<TSchema extends z.ZodType>(
    path: string,
    schema: TSchema,
    options: RequestOptions = {},
  ): Promise<z.output<TSchema>> {
    const response = await this.request({
      ...options,
      method: 'DELETE',
      path,
      schema,
    });

    return response.data;
  }
}

export const createApiClient = (options: ApiClientOptions): StageGateApiClient =>
  new StageGateApiClient(options);
