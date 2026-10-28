import { SetMetadata } from '@nestjs/common';

import type { EventPermission } from '../types';
import { EVENT_PERMISSIONS_KEY } from '../constants';

export const RequireEventPermissions = (
  ...permissions: EventPermission[]
): MethodDecorator => SetMetadata(EVENT_PERMISSIONS_KEY, permissions);
