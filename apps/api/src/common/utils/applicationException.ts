import { HttpException, HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';

export type ErrorDetails = {
  fields?: Record<string, string[]>;
};

export class ApplicationException extends HttpException {
  constructor(
    public readonly code: ErrorCode,
    status: HttpStatus,
    message: string,
    public readonly details?: ErrorDetails,
  ) {
    super({ code, message, details }, status);
  }
}
