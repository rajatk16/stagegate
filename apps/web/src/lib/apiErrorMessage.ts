import { isApiError } from '@stagegate/apiClient';

export const getApiErrorMessage = (error: unknown): string => {
  if (!isApiError(error)) {
    return 'Something went wrong. Please try again.';
  }

  if (error.kind === 'network') {
    return 'Unable to connect to StageGate. Check your connection and try again.';
  }

  if (error.kind === 'timeout') {
    return 'The request took too long. Please try again.';
  }

  if (error.kind === 'contract') {
    return 'An unexpected server response was received. Please try again later.';
  }

  if (error.isUnauthorized) {
    return 'Sign in to continue.';
  }

  if (error.isForbidden) {
    return 'You do not have permission to perform this action.';
  }

  if (error.status === 429) {
    return 'Too many requests. Please wait before trying again.';
  }

  if (error.status !== undefined && error.status >= 500) {
    return 'StageGate is temporarily unavailable. Please try again later.';
  }

  if (error.kind === 'http') {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
};
