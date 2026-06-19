import { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import {
  Catch,
  HttpStatus,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal Sever Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      message = exception.message;
    }

    this.logger.error(message, {
      status,
      message,
      exception,
    });

    response.status(status).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: {
        code: status,
        message,
      },
    });
  }
}
