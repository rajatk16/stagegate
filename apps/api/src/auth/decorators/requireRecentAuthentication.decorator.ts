import { SetMetadata } from '@nestjs/common';

import { REQUIRES_RECENT_AUTHENTICATION_KEY } from '../constants';

export const RequireRecentAuthentication = (): MethodDecorator =>
  SetMetadata(REQUIRES_RECENT_AUTHENTICATION_KEY, true);
