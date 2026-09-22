import { STATUS_CODES } from "node:http";
import type { Request, Response } from "express";
import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";

import { ApiException } from "../exceptions";
import { ApiErrorResponseDto } from "../dtos";

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    const statusCode = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let messages = ['Internal server error'];

    const code = exception instanceof ApiException 
      ? exception.code 
      : statusCode >= 500 
        ? 'INTERNAL_SERVER_ERROR' 
        : `HTTP_${statusCode}`;

    if (exception instanceof ApiException) {
      messages = [exception.publicMessage];
    } else if (exception instanceof HttpException && statusCode < 500) {
      messages = this.getMessages(exception);
    }

    if (statusCode >= 500) {
      this.logger.error(`${request.method} ${request.path} failed (${statusCode})`, exception instanceof Error ? exception.stack : 'A non-Error value was thrown')
    }

    if (response.headersSent) {
      return;
    }

    const body: ApiErrorResponseDto = {
      statusCode,
      error: STATUS_CODES[statusCode] ?? 'Error',
      code,
      message: messages,
      path: request.path,
      timestamp: new Date().toISOString()
    }

    if (statusCode === HttpStatus.UNAUTHORIZED) {
      response.setHeader('WWW-Authenticate', 'Bearer realm="stagegate"');
    }

    response.setHeader('Cache-Control', 'no-store');
    response.status(statusCode).json(body);
  }

  private getMessages(exception: HttpException): string[] {
    const body = exception.getResponse();
    if (typeof body === 'string') {
      return [body];
    }

    if ('message' in body) {
      const message: unknown = body.message;

      if (typeof message === 'string') {
        return [message];
      }

      if (Array.isArray(message)) {
        const messages = message.filter(
          (item): item is string => typeof item === 'string'
        );

        if (messages.length > 0) {
          return messages;
        }
      }
    }

    return [exception.message];
  }
}
