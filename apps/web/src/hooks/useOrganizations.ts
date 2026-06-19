import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';
import { getOrganizations } from '@/services/organizations/api';

export const useOrganizations = () =>
  useQuery({
    queryKey: queryKeys.organizations,
    queryFn: getOrganizations,
  });
