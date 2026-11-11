import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

import { IDENTITY_ERROR_CODES } from '@stagegate/contracts';

import { IdentityError } from '../errors/identity.error';
import { authOperation } from '../utils/authOperation.util';
import { IdentityRequest } from '../types/identityRequest.type';
import { normalizeIdentityEmail } from '../utils/identityEmail.util';
import { FirebaseService } from '../../firebase/services/firebase.service';

@Injectable()
export class FirebaseIdentityGuard implements CanActivate {
  constructor(private readonly firebase: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IdentityRequest>();
    const header = request.headers.authorization;

    if (!header) {
      throw new IdentityError(
        HttpStatus.UNAUTHORIZED,
        IDENTITY_ERROR_CODES.AUTH_REQUIRED,
        'Sign in to continue.',
      );
    }

    const match = /^Bearer ([^\s,]+)$/i.exec(header);

    if (!match) {
      throw new IdentityError(
        HttpStatus.UNAUTHORIZED,
        IDENTITY_ERROR_CODES.INVALID_ID_TOKEN,
        'Sign in again to continue.',
      );
    }

    const auth = this.firebase.auth;
    const token = await authOperation(() => auth.verifyIdToken(match[1], true));
    const email = normalizeIdentityEmail(token.email ?? '');

    if (!token.email_verified || !email) {
      throw new IdentityError(
        HttpStatus.FORBIDDEN,
        IDENTITY_ERROR_CODES.EMAIL_NOT_VERIFIED,
        'Verify your email to continue.',
      );
    }

    request.firebaseIdentity = {
      uid: token.uid,
      email,
    };
    return true;
  }
}
