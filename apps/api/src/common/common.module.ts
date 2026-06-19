import { Module } from '@nestjs/common';
import { GlobalExceptionFilter } from './filters/globalException.filter';
import { ResponseInterceptor } from './interceptors/response.interceptor';

@Module({
  providers: [GlobalExceptionFilter, ResponseInterceptor],
  exports: [GlobalExceptionFilter, ResponseInterceptor],
})
export class CommonModule {}
