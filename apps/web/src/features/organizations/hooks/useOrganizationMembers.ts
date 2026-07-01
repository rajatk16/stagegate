import { useQuery } from '@tanstack/react-query';

import { getMembers, organizationsKeys } from '../api';

export const useOrganizationMembers = (organizationSlug: string) =>
  useQuery({
    queryKey: organizationsKeys.members(organizationSlug),
    queryFn: () => getMembers(organizationSlug),
    enabled: !!organizationSlug,
  });
