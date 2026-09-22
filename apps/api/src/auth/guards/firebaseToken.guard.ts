import { Reflector } from "@nestjs/core";
import { DecodedIdToken } from "firebase-admin/auth";
import { 
  Logger, 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  UnauthorizedException,
  ServiceUnavailableException
} from "@nestjs/common";

import { IS_PUBLIC_KEY } from "../decorators";
import { AuthenticatedRequest } from "../types";
import { FirebaseService } from "../../firebase/services";

const rejectedCredentialCodes = new Set([
  'auth/argument-error',
  'auth/invalid-argument',
  'auth/invalid-id-token',
  'auth/id-token-expired',
  'auth/id-token-revoked',
  'auth/user-disabled',
  'auth/user-not-found',
]);

const getErrorCode = (error: unknown): string | undefined => {
  if (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string') {
    return error.code;
  }

  return undefined;
}

@Injectable()
export class FirebaseTokenGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseTokenGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly firebase: FirebaseService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const header = request.headers.authorization;
    const match = /^Bearer ([^\s,]+)$/i.exec(header ?? '');

    if (!match) {
      throw new UnauthorizedException('A Bearer ID token is required');
    }

    let user: DecodedIdToken;

    try {
      user = await this.firebase.auth.verifyIdToken(match[1], true);
    } catch (error: unknown) {
      const code = getErrorCode(error);

      if (code && rejectedCredentialCodes.has(code)) {
        throw new UnauthorizedException('Invalid or expired ID token.');
      }

      this.logger.error(
        `Firebase token verification failed: ${code ?? 'unknown'}`
      );

      throw new ServiceUnavailableException(
        "Authentication is temporarily unavailable."
      )
    }

    if (
      user.uid.includes('/') ||
      user.uid === '.' ||
      user.uid === '..' ||
      /^__.*__$/.test(user.uid)
    ) {
      throw new UnauthorizedException('Unsupported user identifier');
    }

    request.firebaseUser = user;
    return true;
  }
}
