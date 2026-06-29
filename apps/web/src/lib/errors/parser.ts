import axios, { AxiosError } from 'axios';

import { AppError } from './AppError';
import { ErrorCode } from './ErrorCode';

export const parseError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (axios.isCancel(error)) {
    return new AppError({
      code: ErrorCode.Cancelled,
      message: 'Request was cancelled',
    });
  }

  if (error instanceof AxiosError) {
    if (!error.response) {
      return new AppError({
        code: ErrorCode.Network,
        message: 'Unable to reach the server',
      });
    }

    const status = error.response.status;

    switch (status) {
      case 400:
        return new AppError({
          code: ErrorCode.Validation,
          status,
          message: error.response.data?.message ?? 'Validation failed',
          details: error.response.data,
        });
      case 401:
        return new AppError({
          code: ErrorCode.Unauthorized,
          status,
          message: 'You are not authenticated',
        });
      case 403:
        return new AppError({
          code: ErrorCode.Forbidden,
          status,
          message: 'You are not authorized to perform this action',
        });
      case 404:
        return new AppError({
          code: ErrorCode.NotFound,
          status,
          message: 'The resource you are looking for was not found',
        });
      case 409:
        return new AppError({
          code: ErrorCode.Conflict,
          status,
          message: error.response.data?.message ?? 'Conflict',
        });
      default:
        return new AppError({
          code: ErrorCode.Internal,
          status,
          details: error.response.data,
          message: error.response.data?.message ?? 'Something went wrong',
        });
    }
  }

  if (error instanceof Error) {
    return new AppError({
      message: error.message,
    });
  }

  return new AppError({
    message: 'An unexpected error occurred',
  });
};
