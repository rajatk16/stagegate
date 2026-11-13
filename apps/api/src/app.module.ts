import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { GlobalExceptionFilter } from './common/filters/globalException.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { RequestContextModule } from './common/modules/requestContext.module';
import { validateEnvironment } from './config/schemas/env.schema';
import { AppConfigService } from './config/services/appConfig.service';
import { HealthModule } from './health/modules/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env.local', '.env'],
      ignoreEnvFile: process.env['NODE_ENV'] === 'test',
      validate: validateEnvironment,
    }),
    RequestContextModule,
    HealthModule,
  ],
  providers: [
    AppConfigService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
