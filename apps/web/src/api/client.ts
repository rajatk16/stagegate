import { createApiClient } from '@stagegate/apiClient';

import { appConfig } from '@/config/appConfig';

import { authTokenProvider } from './authTokenProvider';

export const apiClient = createApiClient({
  baseUrl: appConfig.api.baseUrl,
  timeoutMs: appConfig.api.timeoutMs,
  tokenProvider: authTokenProvider,
});
