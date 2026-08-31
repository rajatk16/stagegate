import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

import { AuthenticationError } from '../types';

@Catch(AuthenticationError)
export class AuthenticationExceptionFilter implements ExceptionFilter<AuthenticationError> {
  catch(exception: AuthenticationError, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const status = exception.getStatus();
    const requestId = randomUUID();

    response.setHeader('X-Request-Id', requestId);
    response.setHeader('Cache-Control', 'no-store');

    if (status === 401) {
      response.setHeader(
        'WWW-Authenticate',
        exception.code === 'AUTH_INVALID_TOKEN' ? 'Bearer error="invalid_token"' : 'Bearer ',
      );
    }

    response
      .status(status)
      .type('application/problem+json')
      .json({
        type: `https://stagegate.dev/problems/${exception.code.toLowerCase().replace('_', '-')}`,
        title: status === 401 ? 'Authentication required' : 'Authentication unavailable',
        status,
        code: exception.code,
        detail: exception.message,
        instance: request.path,
        requestId,
      });
  }
}
