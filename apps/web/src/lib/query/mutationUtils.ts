import { AppError } from '../errors';
import { invalidate } from './invalidate';
import { notificationService } from '../notifications';
import type { AppMutationOptions } from './mutationOptions';

export const handleMutationSuccess = async (options: AppMutationOptions) => {
  if (options.invalidate?.length) {
    await invalidate(options.queryClient, ...options.invalidate);
  }

  if (options.successMessage) {
    notificationService.success(options.successMessage);
  }
};

export const handleMutationError = async (
  error: unknown,
  options: AppMutationOptions,
) => {
  if (options.errorMessage) {
    notificationService.error(options.errorMessage);
    return;
  }

  if (error instanceof AppError) {
    notificationService.error(error.message);
    return;
  }

  notificationService.error('Something went wrong.');
};
