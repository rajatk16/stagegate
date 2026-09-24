import { Reflector } from "@nestjs/core";
import { DecodedIdToken } from "firebase-admin/auth";
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";

import { AuthException } from "../../common";
import { IS_PUBLIC_KEY } from "../constants";
import { toAuthException } from "../mappers";
import { AuthenticatedRequest } from "../types";
import { FirebaseService } from "../../firebase/services";
import { RequestContextService } from "../../observalibility";

@Injectable()
export class FirebaseTokenGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly firebase: FirebaseService,
    private readonly contextService: RequestContextService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    );

    if (isPublic === true) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const authorization = request.headers.authorization;

    if (authorization === undefined) {
      throw new AuthException("AUTH_REQUIRED");
    }
    
    const match = /^Bearer ([^\s,]+)$/i.exec(authorization);

    if (!match) {
      throw new AuthException('AUTH_INVALID_TOKEN');
    }

    let user: DecodedIdToken;

    try {
      user = await this.firebase.auth.verifyIdToken(match[1], true);
    } catch (error: unknown) {
      throw toAuthException(error);
    }

    if (
      typeof user.uid !== 'string' ||
      user.uid.length === 0 ||
      user.uid.includes('/') ||
      user.uid === '.' ||
      user.uid === '..' ||
      /^__.*__$/.test(user.uid)
    ) {
      throw new AuthException('AUTH_INVALID_TOKEN');
    }

    request.firebaseUser = user;
    this.contextService.setActor(user.uid);
    return true;
  }
}
