import { Request, Response } from 'express';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

import { IdentityError } from '../utils';
import { randomUUID } from 'crypto';

const problems = {
  VALIDATION_FAILED: {
    status: 422,
    title: 'Request validation failed',
    detail: 'Check the supplied profile fields.',
  },
  USER_NOT_BOOTSTRAPPED: {
    status: 404,
    title: 'Profile not found',
    detail: 'Bootstrap your profile before accessing it.',
  },
  CONCURRENCY_CONFLICT: {
    status: 409,
    title: 'Profile version conflict',
    detail: 'Reload your profile before applying this update.',
  },
  PROFILE_DATA_INVALID: {
    status: 500,
    title: 'Profile unavailable',
    detail: 'The profile could not be processed.',
  },
  PROFILE_UNAVAILABLE: {
    status: 503,
    title: 'Profile service unavailable',
    detail: 'The profile service is temporarily unavailable.',
  },
};

@Catch(IdentityError)
export class IdentityExceptionFilter implements ExceptionFilter<IdentityError> {
  catch(exception: IdentityError, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const problem = problems[exception.code];

    const existingRequestId = response.getHeader('X-Request-Id');
    const requestId =
      typeof existingRequestId === 'string' ? existingRequestId : randomUUID();

    response.setHeader('X-Request-Id', requestId);
    response.setHeader('Cache-Control', 'no-store');

    response
      .status(problem.status)
      .type('application/problem+json')
      .json({
        type: `https://stagegate.dev/problems/${exception.code.toLowerCase().replaceAll('_', '-')}`,
        ...problem,
        code: exception.code,
        instance: request.path,
        requestId,
        ...(exception.fields.length > 0 ? { errors: exception.fields } : {}),
      });
  }
}
