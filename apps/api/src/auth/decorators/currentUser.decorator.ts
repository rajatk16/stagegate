import { DecodedIdToken } from "firebase-admin/auth";
import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";

import { AuthenticatedRequest } from "../types";

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): DecodedIdToken => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.firebaseUser) {
      throw new UnauthorizedException('Authentication required');
    }

    return request.firebaseUser;
  }
)