import { ReqId } from 'pino-http';
import {
  Injectable,
  CallHandler,
  NestInterceptor,
  ExecutionContext,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Request, Response } from 'express';

import { APIResponseDto } from '../dto';

@Injectable()
export class ResponseInterceptor implements NestInterceptor<
  unknown,
  APIResponseDto<unknown>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<APIResponseDto<unknown>> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const requestId = this.getRequestId(request.id);

    response.setHeader('X-Request-Id', requestId);

    return next.handle().pipe(
      map((data: unknown): APIResponseDto<unknown> => ({
        success: true,
        timestamp: new Date().toISOString(),
        requestId,
        data,
      })),
    );
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
