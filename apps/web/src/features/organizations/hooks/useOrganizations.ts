import { useQuery } from '@tanstack/react-query';

import { getOrganizations } from '../api';
import { queryKeys } from '@/api/queryKeys';

export const useOrganizations = () =>
  useQuery({
    queryKey: queryKeys.organizations,
    queryFn: getOrganizations,
  });
