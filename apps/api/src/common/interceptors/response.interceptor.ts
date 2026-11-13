import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { map } from 'rxjs';

import { RAW_RESPONSE_KEY } from '../decorators/rawResponse.decorator';
import { ApiSuccessResponse } from '../interfaces/apiResponse.interface';
import { RequestContextService } from '../services/requestContext.service';

const UNWRAPPED_STATUS_CODES = new Set<number>([
  HttpStatus.NO_CONTENT,
  HttpStatus.RESET_CONTENT,
  HttpStatus.NOT_MODIFIED,
]);

@Injectable()
export class ResponseInterceptor implements NestInterceptor<unknown, unknown> {
  constructor(
    private readonly reflector: Reflector,
    private readonly context: RequestContextService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler<unknown>) {
    const rawResponse = this.reflector.getAllAndOverride<boolean>(RAW_RESPONSE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (rawResponse) {
      return next.handle();
    }

    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data: unknown) => {
        if (
          UNWRAPPED_STATUS_CODES.has(response.statusCode) ||
          response.headersSent ||
          data instanceof StreamableFile
        ) {
          return data;
        }

        const result: ApiSuccessResponse<unknown> = {
          success: true,

          data: data ?? null,

          meta: {
            requestId: this.context.require().requestId,
            timestamp: new Date().toISOString(),
          },
        };

        return result;
      }),
    );
  }
}
