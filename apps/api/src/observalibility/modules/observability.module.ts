import { Global, Module } from '@nestjs/common';

import { RequestContextService } from '../services';
import { RequestLogginMiddleware } from '../middlewares';

@Global()
@Module({
  providers: [RequestContextService, RequestLogginMiddleware],
  exports: [RequestContextService, RequestLogginMiddleware],
})
export class ObservabilityModule {}
