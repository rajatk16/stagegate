import { Module, RequestMethod } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

import { LoggerService } from './logger.service';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      forRoutes: [{ path: '{*path}', method: RequestMethod.ALL }],
      pinoHttp: {
        genReqId: (req) => req.headers['x-request-id'] || crypto.randomUUID(),
        customProps: (req) => ({
          requestId: req.id,
        }),
        level: process.env.LOG_LEVEL || 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                },
              }
            : undefined,
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'req.body',
            'req.query',
            'req.raw.headers.authorization',
            'req.raw.headers.cookie',
          ],
          censor: '[REDACTED]',
        },
      },
    }),
  ],
  exports: [PinoLoggerModule],
  providers: [LoggerService],
})
export class LoggerModule {}
