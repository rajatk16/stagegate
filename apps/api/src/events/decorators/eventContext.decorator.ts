import { SetMetadata } from '@nestjs/common';

export const EVENT_CONTEXT_PARAM = 'eventContextParam';

export const EventContext = (parameterName: string) =>
  SetMetadata(EVENT_CONTEXT_PARAM, parameterName);
