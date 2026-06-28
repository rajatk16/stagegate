import { useMutation } from '@tanstack/react-query';

import { firebaseAuthService } from '../services';

export const useAuthenticate = () => {
  const mutation = useMutation({
    mutationFn: () => firebaseAuthService.signInWithGoogle(),
  });

  return {
    error: mutation.error,
    isPending: mutation.isPending,
    authenticate: mutation.mutateAsync,
  };
};
