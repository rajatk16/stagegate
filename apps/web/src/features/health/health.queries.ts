import { queryOptions, useQuery } from '@tanstack/react-query';

import { useApiClient } from '@/api/useApiClient';
import { queryKeys } from '@/lib/queryKeys';

import type { StageGateApiClient } from '@stagegate/apiClient';
import type { HealthResponse } from '@stagegate/contracts';
import type { UseQueryResult } from '@tanstack/react-query';

export const healthReadinessOptions = (client: StageGateApiClient) =>
  queryOptions({
    queryKey: queryKeys.health.readiness(),

    queryFn: ({ signal }): Promise<HealthResponse> =>
      client.health.readiness({
        signal,
      }),

    staleTime: 10_000,

    refetchInterval: 30_000,

    refetchIntervalInBackground: false,

    retry: false,
  });

export const healthLivenessOptions = (client: StageGateApiClient) =>
  queryOptions({
    queryKey: queryKeys.health.liveness(),

    queryFn: ({ signal }): Promise<HealthResponse> =>
      client.health.liveness({
        signal,
      }),

    staleTime: 10_000,

    retry: false,
  });

export const useApiReadiness = (): UseQueryResult<HealthResponse> => {
  const client = useApiClient();

  return useQuery(healthReadinessOptions(client));
};

export const useApiLiveness = (): UseQueryResult<HealthResponse> => {
  const client = useApiClient();

  return useQuery(healthLivenessOptions(client));
};
