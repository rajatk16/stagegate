import { Response } from 'express';
import { randomUUID } from 'node:crypto';
import {
  Catch,
  Logger,
  HttpStatus,
  ArgumentsHost,
  ExceptionFilter,
} from '@nestjs/common';

import { ApiError } from '../errors/api.error';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(error: unknown, host: ArgumentsHost): void {
    const requestId = randomUUID();
    const response = host.switchToHttp().getResponse<Response>();
    const failure =
      error instanceof ApiError
        ? error
        : new ApiError(
            HttpStatus.INTERNAL_SERVER_ERROR,
            'INTERNAL_ERROR',
            'An unexpected error occurred.',
          );

    if (failure.getStatus() >= 500) {
      this.logger.error({ requestId, code: failure.code });
    }

    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Request-Id', requestId);
    response.status(failure.getStatus()).json({
      code: failure.code,
      message: failure.message,
      requestId,
    });
  }
}
