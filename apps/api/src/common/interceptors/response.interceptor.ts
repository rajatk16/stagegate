import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';

import { RAW_RESPONSE_KEY } from '../decorators/rawResponse.decorator';
import { ApiSuccessResponse } from '../interfaces/apiResponse.interface';
import { RequestContextService } from '../services/requestContext.service';

@Injectable()
export class ResponseInterceptor implements NestInterceptor<unknown, unknown> {
  constructor(
    private readonly reflector: Reflector,
    private readonly context: RequestContextService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const rawResponse = this.reflector.getAllAndOverride<boolean>(RAW_RESPONSE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (rawResponse) {
      return next.handle();
    }

    return next.handle().pipe(
      map(
        (data: unknown): ApiSuccessResponse<unknown> => ({
          success: true,
          data: data ?? null,
          meta: {
            requestId: this.context.require().requestId,
            timestamp: new Date().toISOString(),
          },
        }),
      ),
    );
  }
}
