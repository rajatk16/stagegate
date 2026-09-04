import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';
import { ArgumentsHost, Catch, type ExceptionFilter } from '@nestjs/common';

import { TenancyError, type TenancyErrorCode } from '../utils';

const problems = {
  VALIDATION_ERROR: {
    status: 422,
    title: 'Request validation failed',
    detail: 'Check the supplied organization fields.',
  },
  ACTOR_NOT_BOOTSTRAPPED: {
    status: 409,
    title: 'Account setup required',
    detail: 'Bootstrap your user profile before creating an organization.',
  },
  ORGANIZATION_NOT_FOUND: {
    status: 404,
    title: 'Organization not found',
    detail: 'The organization does not exist or is not accessible.',
  },
  TENANCY_DATA_INVALID: {
    status: 500,
    title: 'Organization unavailable',
    detail: 'The organization data could not be processed.',
  },
  TENANCY_UNAVAILABLE: {
    status: 503,
    title: 'Organization service unavailable',
    detail: 'The organization service is temporarily unavailable.',
  },
} as const satisfies Record<
  TenancyErrorCode,
  {
    readonly status: number;
    readonly title: string;
    readonly detail: string;
  }
>;

@Catch(TenancyError)
export class TenancyExceptionFilter implements ExceptionFilter<TenancyError> {
  catch(exception: TenancyError, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const problem = problems[exception.code];

    const existingRequestId = response.getHeader('X-Request-Id');
    const requestId = typeof existingRequestId === 'string' ? existingRequestId : randomUUID();

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
