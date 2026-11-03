import {
  ExecutionContext,
  createParamDecorator,
  InternalServerErrorException,
} from '@nestjs/common';

import type { EventRequest } from '../types/eventRequest.type';
import { EventScope } from '../types/eventScope.type';

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
