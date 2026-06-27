export const queryKeys = {
  all: ['auth'],
  me: () => [...queryKeys.all, 'me'],
};
