import { Reflector } from "@nestjs/core";
import { CanActivate, ExecutionContext, Injectable, InternalServerErrorException } from "@nestjs/common";

import { AuthException } from "../../common";
import { AuthenticatedRequest } from "../types";
import { IS_PUBLIC_KEY, REQUIRES_VERIFIED_EMAIL_KEY } from "../constants";

@Injectable()
export class VerifiedEmailGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const handler = context.getHandler();

    const required = this.reflector.get<boolean>(
      REQUIRES_VERIFIED_EMAIL_KEY,
      handler
    );
    if (required !== true) {
      return true;
    }

    if (this.reflector.get<boolean>(IS_PUBLIC_KEY, handler) === true) {
      throw new InternalServerErrorException('A verified email endpoint cannot be public');
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const user = request.firebaseUser;

    if (!user) {
      throw new AuthException('AUTH_REQUIRED');
    }

    if (user.email_verified !== true || typeof user.email !== 'string' || user.email.trim().length === 0) {
      throw new AuthException('AUTH_EMAIL_NOT_VERIFIED');
    }

    return true;
  }
}
