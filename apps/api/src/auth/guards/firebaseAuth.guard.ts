import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import {
  HttpStatus,
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';

import { ErrorCode, ApplicationException } from '@/common';

import { AuthService } from '../services/auth.service';
import { IS_PUBLIC_KEY, REQUIRE_RECENT_AUTH_KEY } from '../decorators';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const reauthRequirement = this.reflector.getAllAndOverride<
      boolean | number
    >(REQUIRE_RECENT_AUTH_KEY, [context.getHandler(), context.getClass()]);

    const requiresRecentAuth = Boolean(reauthRequirement);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new ApplicationException(
        ErrorCode.UNAUTHENTICATED,
        HttpStatus.UNAUTHORIZED,
        'Unauthorized',
      );
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new ApplicationException(
        ErrorCode.UNAUTHENTICATED,
        HttpStatus.UNAUTHORIZED,
        'Unauthorized',
      );
    }

    const decoded = await this.authService.verifyToken(token, {
      checkRevoked: requiresRecentAuth,
    });

    if (requiresRecentAuth) {
      const maxAgeSeconds =
        typeof reauthRequirement === 'number'
          ? reauthRequirement
          : this.authService.sensitiveReauthMaxAgeSeconds;

      const authTime = decoded.auth_time;

      if (!authTime || Date.now() / 1000 - authTime > maxAgeSeconds) {
        throw new ApplicationException(
          ErrorCode.UNAUTHENTICATED,
          HttpStatus.UNAUTHORIZED,
          'Recent authentication required for this action',
        );
      }
    }

    const appUser = await this.authService.getOrCreateUser(decoded);

    request.context = {
      user: {
        userId: appUser.id,
        firebaseUid: appUser.firebaseUid,
        email: appUser.email,
        displayName: appUser.displayName,
      },
    };

    request.log = request.log.child({
      userId: appUser.id,
      firebaseUid: appUser.firebaseUid,
    });

    return true;
  }
}
