import { Request } from 'express';
import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const CurrentEvent = createParamDecorator(
  (_data, context: ExecutionContext) =>
    context.switchToHttp().getRequest<Request>().context?.event,
);
