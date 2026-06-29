import { AppError } from './AppError';
import type { ErrorCode } from './ErrorCode';

export const isAppError = (error: unknown): error is AppError =>
  error instanceof AppError;

export const hasErrorCode = (error: unknown, code: ErrorCode): boolean =>
  error instanceof AppError && error.code === code;
