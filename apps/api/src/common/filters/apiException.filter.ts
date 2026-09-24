import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException } from "@nestjs/common";

import { ApiException } from "../exceptions";
import { ApiErrorResponseDto } from "../dtos";
import { toPublicApiError } from "../mappers";
import { RequestContextService } from "../../observalibility";

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  constructor(private readonly contexts: RequestContextService) {}
  
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const mapped = toPublicApiError(exception);
    const context = this.contexts.get();

    const existingId = response.getHeader('X-Request-Id');
    const requestId = context?.requestId ??
      (typeof existingId === 'string' ? existingId : randomUUID());

    if (context) {
      context.errorCode = mapped.code;
      context.errorKind = exception instanceof ApiException
        ? 'application'
        : exception instanceof HttpException
          ? 'http'
          : 'unexpected';
    }

    if (response.headersSent) {
      response.destroy();
      return;
    }

    const body: ApiErrorResponseDto = {
      ...mapped,
      requestId,
      path: request.path,
      timestamp: new Date().toISOString()
    };

    response.setHeader('X-Request-ID', requestId);
    response.setHeader('Cache-Control', 'no-store');

    if (mapped.statusCode === 401) {
      response.setHeader(
        'WWW-Authenticate',
        'Bearer realm="stagegate"'
      );
    }

    response.status(mapped.statusCode).json(body);
  }
}
