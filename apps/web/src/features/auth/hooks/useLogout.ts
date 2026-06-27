import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AuthSessionService } from '../services';

export const useLogout = () => {
  const queryClient = useQueryClient();

  const sessionService = useMemo(
    () => new AuthSessionService(queryClient),
    [queryClient],
  );

  const mutation = useMutation({
    mutationFn: () => sessionService.signOut(),
  });

  return {
    error: mutation.error,
    signOut: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};
