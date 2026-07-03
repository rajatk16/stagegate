import { createQueryKeys } from '@/lib';

const authRoot = createQueryKeys('auth');

export const queryKeys = {
  ...authRoot,
  me: () => [...queryKeys.all, 'me'],
};
