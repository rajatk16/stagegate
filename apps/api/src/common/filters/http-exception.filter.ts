import { Request } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    this.logger.error(
      {
        exception,
        path: request.url,
      },
      'Unhandled excpetion',
    );

    throw exception;
  }
}
