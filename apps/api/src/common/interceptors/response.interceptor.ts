import {
  Injectable,
  CallHandler,
  NestInterceptor,
  ExecutionContext,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

import { APIResponseDto } from '../dto/APIResponse.dto';

@Injectable()
export class ResponseInterceptor implements NestInterceptor<
  unknown,
  APIResponseDto<unknown>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<APIResponseDto<unknown>> {
    return next.handle().pipe(
      map(
        (data: unknown): APIResponseDto<unknown> => ({
          success: true,
          timestamp: new Date().toISOString(),
          data,
        }),
      ),
    );
  }
}
