import { SetMetadata } from '@nestjs/common';

import { EVENT_SCOPE_KEY } from '../constants';

export const EventScoped = (): ClassDecorator & MethodDecorator =>
  SetMetadata(EVENT_SCOPE_KEY, true);
