import { useMutation } from '@tanstack/react-query';

export function useApiMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
) {
  return useMutation({
    mutationFn,
  });
}
