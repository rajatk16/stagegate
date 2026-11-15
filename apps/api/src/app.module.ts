import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { GlobalExceptionFilter } from './common/filters/globalException.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { RequestContextModule } from './common/modules/requestContext.module';
import { AppConfigModule } from './config/modules/appConfig.module';
import { AppConfigService } from './config/services/appConfig.service';
import { FirebaseModule } from './firebase/modules/firebase.module';
import { HealthModule } from './health/modules/health.module';

@Module({
  imports: [AppConfigModule, RequestContextModule, HealthModule, FirebaseModule],
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
