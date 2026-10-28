import {
  ExecutionContext,
  createParamDecorator,
  InternalServerErrorException,
} from '@nestjs/common';

import type { EventRequest, EventScope } from '../types';

export const CurrentEvent = createParamDecorator(
  (_data: unknown, context: ExecutionContext): EventScope => {
    const request = context.switchToHttp().getRequest<EventRequest>();

    const scope = request.eventScope;

    if (
      !scope ||
      scope.actorUid !== request.firebaseUser?.uid ||
      scope.organizationId !== request.params.organizationId ||
      scope.eventId !== request.params.eventId
    ) {
      throw new InternalServerErrorException(
        'Event scope was not resolved for this request.',
      );
    }

    return scope;
  },
);
