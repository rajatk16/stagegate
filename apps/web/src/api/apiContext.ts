import { createContext } from 'react';

import type { StageGateApiClient } from '@stagegate/apiClient';

export const ApiClientContext = createContext<StageGateApiClient | null>(null);
