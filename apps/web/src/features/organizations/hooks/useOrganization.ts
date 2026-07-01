import { useQuery } from '@tanstack/react-query';

import { get, organizationsKeys } from '../api';

export const useOrganization = (organizationSlug: string) =>
  useQuery({
    queryKey: organizationsKeys.detail(organizationSlug),
    queryFn: () => get(organizationSlug),
    enabled: !!organizationSlug,
  });
