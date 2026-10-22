import { firebaseAuth } from '@/lib';
import { QueryKey, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from 'firebase/auth';

type Options<TArgs extends unknown[], TData> = {
  user: User;
  request: (user: User, ...args: TArgs) => Promise<TData>;
  affected: readonly QueryKey[];
  onSuccess?: (data: TData, args: TArgs) => void;
};

export const useApiMutation = <TArgs extends unknown[], TData>({
  user,
  request,
  affected,
  onSuccess,
}: Options<TArgs, TData>) => {
  const client = useQueryClient();

  const mutation = useMutation<TData, Error, TArgs>({
    mutationFn: (args) => request(user, ...args),
    retry: false,
    networkMode: 'always',
    gcTime: 0,
    onMutate: async () => {
      await Promise.all(
        affected.map((queryKey) => client.cancelQueries({ queryKey })),
      );
    },

    onSuccess: (data, args) => {
      if (firebaseAuth.currentUser !== user) return;

      onSuccess?.(data, args);
    },
    onSettled: () => {
      if (firebaseAuth.currentUser !== user) return;

      for (const queryKey of affected) {
        void client.invalidateQueries({ queryKey });
      }
    },
  });

  return {
    ...mutation,
    execute: (...args: TArgs) => mutation.mutateAsync(args),
  };
};
