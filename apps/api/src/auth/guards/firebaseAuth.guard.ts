import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthService } from '../auth.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

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

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException();
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer') {
      throw new UnauthorizedException();
    }

    const decoded = await this.authService.verifyToken(token);

    const appUser = await this.authService.getOrCreateUser(decoded);

    request.context = {
      user: {
        userId: appUser.id,
        firebaseUid: appUser.firebaseUid,
        email: appUser.email,
        displayName: appUser.displayName,
      },
      organizationId: undefined,
      roles: [],
    };

    request.log = request.log.child({
      userId: appUser.id,
      firebaseUid: appUser.firebaseUid,
    });

    return true;
  }
}
