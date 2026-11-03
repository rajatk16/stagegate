import { applyDecorators, SetMetadata } from '@nestjs/common';

import { SENSITIVE_ACTION_KEY } from '../constants';
import { SensitiveActionName } from '../policies/sensitiveAction.policy';
import { RequireVerifiedEmail } from './requireVerifiedEmail.decorator';

export const SensitiveAction = (action: SensitiveActionName): MethodDecorator =>
  applyDecorators(
    SetMetadata(SENSITIVE_ACTION_KEY, action),
    RequireVerifiedEmail(),
  );
