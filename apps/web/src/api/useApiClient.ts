import { useContext } from 'react';

import { ApiClientContext } from './apiContext';

import type { StageGateApiClient } from '@stagegate/apiClient';

export const useApiClient = (): StageGateApiClient => {
  const client = useContext(ApiClientContext);

  if (client === null) {
    throw new Error('useApiClient must be used within ApiProvider');
  }

  return client;
};
