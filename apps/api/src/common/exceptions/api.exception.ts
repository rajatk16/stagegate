import { HttpException } from '@nestjs/common';

import type { ValidationErrorDetail } from '../interfaces/apiResponse.interface';

export interface ApiExceptionOptions {
  status: number;
  code: string;
  message: string;
  details?: ValidationErrorDetail[];
  cause?: unknown;
}

export class ApiException extends HttpException {
  readonly code: string;

  readonly publicMessage: string;

  readonly details: ValidationErrorDetail[] | undefined;

  constructor(options: ApiExceptionOptions) {
    super(options.message, options.status, {
      cause: options.cause,
    });

    this.code = options.code;
    this.publicMessage = options.message;
    this.details = options.details;
  }
}
