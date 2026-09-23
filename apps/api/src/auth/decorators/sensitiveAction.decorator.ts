import { applyDecorators, SetMetadata } from "@nestjs/common";

import { SensitiveActionName } from "../policies";
import { SENSITIVE_ACTION_KEY } from "../constants";
import { RequireVerifiedEmail } from "./requireVerifiedEmail.decorator";

export const SensitiveAction = (
  action: SensitiveActionName
): MethodDecorator => applyDecorators(
  SetMetadata(SENSITIVE_ACTION_KEY, action),
  RequireVerifiedEmail()
);
