import { randomUUID } from 'node:crypto';

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { ERROR_CODES, HTTP_ERROR_CODES } from '../constants/errorCodes';
import { ApiException } from '../exceptions/api.exception';
import { ApiError, ApiErrorResponse } from '../interfaces/apiResponse.interface';
import { REQUEST_ID_HEADER } from '../middlewares/requestContext.middleware';
import { RequestContextService } from '../services/requestContext.service';

const PUBLIC_MESSAGES: Readonly<Record<number, string>> = {
  400: 'The request is invalid.',
  401: 'Authentication is required.',
  403: 'Access to this resource is forbidden.',
  404: 'The requested resource was not found.',
  405: 'The HTTP method is not allowed.',
  409: 'The request conflicts with the current resource state.',
  413: 'The request payload is too large.',
  415: 'The request media type is unsupported.',
  422: 'The request could not be processed.',
  429: 'Too many requests. Try again later.',
  500: 'An unexpected error occurred.',
  502: 'An upstream service returned an invalid response.',
  503: 'The service is temporarily unavailable.',
  504: 'An upstream service timed out.',
};

const normalizeStatus = (status: number): number =>
  Number.isInteger(status) && status >= 400 && status <= 599
    ? status
    : HttpStatus.INTERNAL_SERVER_ERROR;

const resolveStatus = (exception: unknown): number => {
  if (exception instanceof HttpException) {
    return normalizeStatus(exception.getStatus());
  }

  if (exception instanceof Error && 'status' in exception && typeof exception.status === 'number') {
    return normalizeStatus(exception.status);
  }

  return HttpStatus.INTERNAL_SERVER_ERROR;
};

const resolvePublicError = (exception: unknown, status: number): ApiError => {
  if (exception instanceof ApiException && status < 500) {
    return {
      code: exception.code,
      message: exception.publicMessage,
      ...(exception.details !== undefined
        ? {
            details: exception.details,
          }
        : {}),
    };
  }

  return {
    code:
      HTTP_ERROR_CODES[status] ??
      (status >= 500 ? ERROR_CODES.INTERNAL_SERVER_ERROR : ERROR_CODES.HTTP_ERROR),
    message:
      PUBLIC_MESSAGES[status] ??
      (status >= 500 ? 'An unexpected error occurred' : 'The request could not be completed.'),
  };
};

@Catch()
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter<unknown> {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(
    private readonly adapterHost: HttpAdapterHost,
    private readonly context: RequestContextService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.adapterHost;

    const response = host.switchToHttp().getResponse<Response>();

    const status = resolveStatus(exception);

    const requestId = this.context.getRequestId() ?? randomUUID();

    if (status >= 500) {
      this.logger.error(`HTTP request failed: status=${String(status)} requestId=${requestId}`);
    }

    if (httpAdapter.isHeadersSent(response)) {
      httpAdapter.end(response);
      return;
    }

    const body: ApiErrorResponse = {
      success: false,
      error: resolvePublicError(exception, status),
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    };

    httpAdapter.setHeader(response, REQUEST_ID_HEADER, requestId);

    httpAdapter.reply(response, body, status);
  }
}
