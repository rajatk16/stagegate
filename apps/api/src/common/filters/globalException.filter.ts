import { ReqId } from 'pino-http';
import { PinoLogger } from 'nestjs-pino';
import { Request, Response } from 'express';
import {
  Catch,
  HttpStatus,
  ArgumentsHost,
  HttpException,
  ExceptionFilter,
} from '@nestjs/common';

import { ErrorCode } from '../enums';
import { ApplicationException } from '../utils';

type ErrorResponse = {
  success: false;
  timestamp: string;
  error: {
    code: ErrorCode;
    message: string;
    requestId: string;
    details?: {
      fields?: Record<string, string[]>;
    };
  };
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const requestId = this.getRequestId(request.id);
    const normalized = this.normalizeException(exception);

    this.logger.error(
      {
        requestId,
        method: request.method,
        path: request.path,
        statusCode: normalized.statusCode,
        errorCode: normalized.code,
        error: this.toLoggableError(exception),
      },
      'Request failed',
    );

    response.setHeader('X-Request-Id', requestId);

    const body: ErrorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      error: {
        code: normalized.code,
        message: normalized.message,
        requestId,
        ...(normalized.details ? { details: normalized.details } : {}),
      },
    };

    response.status(normalized.statusCode).json(body);
  }

  private normalizeException(exception: unknown): {
    statusCode: number;
    code: ErrorCode;
    message: string;
    details?: {
      fields?: Record<string, string[]>;
    };
  } {
    if (exception instanceof ApplicationException) {
      return {
        statusCode: exception.getStatus(),
        code: exception.code,
        message: exception.message,
        details: exception.details,
      };
    }

    if (exception instanceof HttpException) {
      return this.normalizeHttpException(exception);
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Internal Server Error',
    };
  }

  private normalizeHttpException(exception: HttpException): {
    statusCode: number;
    code: ErrorCode;
    message: string;
  } {
    const statusCode = exception.getStatus();

    switch (statusCode) {
      case Number(HttpStatus.BAD_REQUEST):
        return {
          statusCode,
          code: ErrorCode.VALIDATION_ERROR,
          message: 'The request is invalid.',
        };

      case Number(HttpStatus.UNAUTHORIZED):
        return {
          statusCode,
          code: ErrorCode.UNAUTHENTICATED,
          message: 'Authentication is required.',
        };

      case Number(HttpStatus.FORBIDDEN):
        return {
          statusCode,
          code: ErrorCode.FORBIDDEN,
          message: 'You do not have permission to perform this action.',
        };

      case Number(HttpStatus.NOT_FOUND):
        return {
          statusCode,
          code: ErrorCode.RESOURCE_NOT_FOUND,
          message: 'The requested resource was not found.',
        };

      case Number(HttpStatus.CONFLICT):
        return {
          statusCode,
          code: ErrorCode.CONFLICT,
          message: 'The request conflicts with the current resource state.',
        };

      case Number(HttpStatus.TOO_MANY_REQUESTS):
        return {
          statusCode,
          code: ErrorCode.RATE_LIMITED,
          message: 'Too many requests. Please try again later.',
        };

      case Number(HttpStatus.PAYLOAD_TOO_LARGE):
        return {
          statusCode,
          code: ErrorCode.PAYLOAD_TOO_LARGE,
          message: 'The request payload is too large.',
        };

      case Number(HttpStatus.SERVICE_UNAVAILABLE):
        return {
          statusCode,
          code: ErrorCode.SERVICE_UNAVAILABLE,
          message: 'Service is temporarily unavailable.',
        };

      default:
        return {
          statusCode,
          code: ErrorCode.INTERNAL_ERROR,
          message: 'An unexpected error occurred.',
        };
    }
  }

  private toLoggableError(exception: unknown): Record<string, unknown> {
    if (!(exception instanceof Error)) {
      return {
        name: 'UnknownException',
        message: 'A non-Error value was thrown',
      };
    }

    return {
      name: exception.name,
      message: exception.message,
      stack: exception.stack,
      cause: this.toLoggableCause(exception.cause),
    };
  }

  private toLoggableCause(cause: unknown): Record<string, unknown> | undefined {
    if (!(cause instanceof Error)) {
      return undefined;
    }

    return {
      name: cause.name,
      message: cause.message,
      stack: cause.stack,
    };
  }

  private getRequestId(id: ReqId): string {
    if (typeof id === 'string') {
      return id;
    }

    if (typeof id === 'number') {
      return String(id);
    }

    return 'unknown';
  }
}
