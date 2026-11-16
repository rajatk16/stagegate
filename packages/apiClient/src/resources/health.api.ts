import { HEALTH_ENDPOINTS, healthResponseSchema, type HealthResponse } from '@stagegate/contracts';

import { executeRawRequest } from '../core/request.js';

import type { ApiClientOptions } from '../core/apiClient.types.js';
import type { AxiosInstance } from 'axios';

export type { HealthResponse } from '@stagegate/contracts';

export interface HealthRequestOptions {
  signal?: AbortSignal;
}

export class HealthApi {
  constructor(
    private readonly client: AxiosInstance,
    private readonly options: ApiClientOptions,
  ) {}

  liveness(options: HealthRequestOptions = {}): Promise<HealthResponse> {
    return executeRawRequest(
      this.client,
      {
        ...options,
        method: 'GET',
        path: HEALTH_ENDPOINTS.LIVENESS,
        auth: 'none',
        schema: healthResponseSchema,
      },
      this.options,
    );
  }

  readiness(options: HealthRequestOptions = {}): Promise<HealthResponse> {
    return executeRawRequest(
      this.client,
      {
        ...options,
        method: 'GET',
        path: HEALTH_ENDPOINTS.READINESS,
        auth: 'none',
        schema: healthResponseSchema,
        acceptedStatuses: [200, 503],
      },
      this.options,
    );
  }
}
