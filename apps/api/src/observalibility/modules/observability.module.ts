import { Global, Module } from '@nestjs/common';

import { RequestContextService } from '../services/requestContext.service';
import { RequestLogginMiddleware } from '../middlewares/requestLogging.middleware';

@Global()
@Module({
  providers: [RequestContextService, RequestLogginMiddleware],
  exports: [RequestContextService, RequestLogginMiddleware],
})
export class ObservabilityModule {}
