import { Global, Module } from "@nestjs/common";

import { RequestContextService } from "./services";
import { RequestLogginMiddleware } from "./middlewares";

@Global()
@Module({
  providers: [
    RequestContextService,
    RequestLogginMiddleware,
  ],
  exports: [
    RequestContextService,
    RequestLogginMiddleware
  ]
})
export class ObservabilityModule {}

export * from './types';
export * from './loggers';
export * from './services';
export * from './middlewares';
