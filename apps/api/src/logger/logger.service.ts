import { PinoLogger } from 'nestjs-pino';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LoggerService {
  constructor(private readonly logger: PinoLogger) {}

  info(message: string, context?: object) {
    this.logger.info(context, message);
  }

  warn(message: string, context?: object) {
    this.logger.warn(context, message);
  }

  error(message: string, error?: Error, context?: object) {
    this.logger.error(
      {
        ...context,
        err: error,
      },
      message,
    );
  }
}
