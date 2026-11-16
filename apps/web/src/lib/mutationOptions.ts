import { mutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';

import { isApiError } from '@stagegate/apiClient';

import { getApiErrorMessage } from './apiErrorMessage';

interface MutationConfiguration<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  successMessage?: string;
  showErrorToast?: boolean;
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (error: Error, variables: TVariables) => void | Promise<void>;
}

export const createMutationOptions = <TData, TVariables>(
  configuration: MutationConfiguration<TData, TVariables>,
) =>
  mutationOptions({
    mutationFn: configuration.mutationFn,
    retry: false,
    async onSuccess(data, variables) {
      await configuration.onSuccess?.(data, variables);

      if (configuration.successMessage) {
        toast.success(configuration.successMessage);
      }
    },
    async onError(error, variables) {
      if (isApiError(error) && error.isCancelled) {
        return;
      }

      await configuration.onError?.(error, variables);

      if (configuration.showErrorToast !== false) {
        toast.error(getApiErrorMessage(error));
      }
    },
  });
