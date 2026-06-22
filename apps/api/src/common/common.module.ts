import { Module } from '@nestjs/common';

import { GlobalExceptionFilter } from './filters';
import { ResponseInterceptor } from './interceptors';

@Module({
  providers: [GlobalExceptionFilter, ResponseInterceptor],
  exports: [GlobalExceptionFilter, ResponseInterceptor],
})
export class CommonModule {}
