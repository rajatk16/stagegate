import { useQuery } from '@tanstack/react-query';

import { list, organizationsKeys } from '../api';

export const useOrganizations = () =>
  useQuery({
    queryKey: organizationsKeys.list(),
    queryFn: list,
  });
