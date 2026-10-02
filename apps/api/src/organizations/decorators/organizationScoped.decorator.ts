import { SetMetadata } from '@nestjs/common';

import { ORGANIZATION_SCOPE_KEY } from '../constants';

export const OrganizationScoped = (): ClassDecorator & MethodDecorator =>
  SetMetadata(ORGANIZATION_SCOPE_KEY, true);
