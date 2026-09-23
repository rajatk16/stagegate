import { SetMetadata } from "@nestjs/common";

import { REQUIRES_VERIFIED_EMAIL_KEY } from "../constants";

export const RequireVerifiedEmail = (): MethodDecorator => SetMetadata(REQUIRES_VERIFIED_EMAIL_KEY, true);
