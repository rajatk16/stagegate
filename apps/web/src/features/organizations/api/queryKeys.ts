import { createQueryKeys } from '@/lib/query/createQueryKeys';

const organizationsRoot = createQueryKeys('organizations');

export const organizationsQueryKeys = {
  ...organizationsRoot,
  list: () => [...organizationsRoot.lists(), 'list'],
  detail: (slug: string) => [...organizationsRoot.details(), slug],
};
