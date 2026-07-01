import { useQuery } from '@tanstack/react-query';

import { getCurrentMember, organizationsKeys } from '../api';

export const useCurrentOrganizationMember = (organizationSlug: string) =>
  useQuery({
    enabled: !!organizationSlug,
    queryFn: () => getCurrentMember(organizationSlug),
    queryKey: organizationsKeys.currentMember(organizationSlug),
  });
