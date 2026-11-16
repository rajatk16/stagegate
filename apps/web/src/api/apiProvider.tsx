import { ApiClientContext } from './apiContext';
import { apiClient } from './client';

import type { StageGateApiClient } from '@stagegate/apiClient';
import type { PropsWithChildren } from 'react';

interface ApiProviderProps extends PropsWithChildren {
  client?: StageGateApiClient;
}

export const ApiProvider = ({ children, client = apiClient }: ApiProviderProps) => (
  <ApiClientContext.Provider value={client}>{children}</ApiClientContext.Provider>
);
