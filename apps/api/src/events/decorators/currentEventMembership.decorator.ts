import { Request } from 'express';
import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const CurrentEventMembership = createParamDecorator(
  (_data, context: ExecutionContext) =>
    context.switchToHttp().getRequest<Request>().context?.eventMembership,
);
