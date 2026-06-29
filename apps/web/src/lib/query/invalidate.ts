import type { QueryClient, QueryKey } from '@tanstack/react-query';

export const invalidate = async (
  queryClient: QueryClient,
  ...queryKeys: readonly QueryKey[]
): Promise<void> => {
  await Promise.all(
    queryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  );
};
