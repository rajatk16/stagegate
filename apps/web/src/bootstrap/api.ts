import { getCurrentUser } from '@/features/auth/api';
import type { BootstrapData } from './types';

export const bootstrapApp = async (): Promise<BootstrapData> => {
  const authenticatedUser = await getCurrentUser();

  return {
    authenticatedUser,
  };
};
