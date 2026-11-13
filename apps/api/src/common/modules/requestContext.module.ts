import { Global, Module } from '@nestjs/common';

import { RequestContextMiddleware } from '../middlewares/requestContext.middleware';
import { RequestContextService } from '../services/requestContext.service';

@Global()
@Module({
  providers: [RequestContextService, RequestContextMiddleware],
  exports: [RequestContextService, RequestContextMiddleware],
})
export class RequestContextModule {}
