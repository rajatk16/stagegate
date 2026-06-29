import { createQueryKeys } from '@/lib/query/createQueryKeys';

const authRoot = createQueryKeys('auth');

export const queryKeys = {
  ...authRoot,
  me: () => [...queryKeys.all, 'me'],
};
