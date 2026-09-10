import { createContext } from 'react';

import type { Organization } from '../services';

export interface OrganizationContextValue {
  readonly organizations: readonly Organization[];
  readonly activeOrganization: Organization | null;
  readonly isLoading: boolean;
  readonly isCreating: boolean;
  readonly error: Error | null;
  readonly selectOrganization: (organizationId: string) => void;
  readonly createOrganization: (name: string) => Promise<void>;
  readonly reload: () => void;
}

export const OrganizationContext = createContext<OrganizationContextValue | null>(null);
