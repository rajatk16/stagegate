import { ErrorCode } from './ErrorCode';

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status?: number;
  readonly details?: unknown;

  constructor({
    message,
    code = ErrorCode.Unknown,
    status,
    details,
  }: {
    status?: number;
    message: string;
    code?: ErrorCode;
    details?: unknown;
  }) {
    super(message);

    this.code = code;
    this.status = status;
    this.name = 'AppError';
    this.details = details;
  }
}
