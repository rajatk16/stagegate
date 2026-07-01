import type { PropsWithChildren } from 'react';

import { useOrganizationInitialization } from '@/features/organizations';

export const OrganizationProvider = ({ children }: PropsWithChildren) => {
  const { isReady } = useOrganizationInitialization();

  if (!isReady) return null;
  return children;
};
