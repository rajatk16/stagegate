import { DecodedIdToken } from 'firebase-admin/auth';
import { Timestamp } from 'firebase-admin/firestore';
import { HttpStatus, Injectable } from '@nestjs/common';

import { User } from '@/users/entities';
import { ErrorCode } from '@/common/enums';
import { UserStatus } from '@/users/enums';
import { ConfigService } from '@nestjs/config';
import { ApplicationException } from '@/common/utils';
import { UserRepository } from '@/users/repositories';
import { createUserFactory } from '@/users/factories';
import { FirebaseService } from '@/firebase/firebase.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
    private readonly firebaseService: FirebaseService,
  ) {}

  sensitiveReauthMaxAgeSeconds = 600;

  async verifyToken(
    token: string,
    options: { checkRevoked?: boolean } = {},
  ): Promise<DecodedIdToken> {
    try {
      const decoded = await this.firebaseService.auth.verifyIdToken(
        token,
        options.checkRevoked ?? false,
      );

      this.assertAllowedProvider(decoded);

      return decoded;
    } catch {
      throw new ApplicationException(
        ErrorCode.UNAUTHENTICATED,
        HttpStatus.UNAUTHORIZED,
        'Invalid or revoked Firebase token',
      );
    }
  }

  async getOrCreateUser(decodedToken: DecodedIdToken) {
    const identity = this.getVerifiedIdentity(decodedToken);

    const existingUser = await this.userRepository.findByFirebaseUid(
      decodedToken.uid,
    );

    if (existingUser) {
      this.assertUserCanAccessApplication(existingUser);

      await this.userRepository.update(existingUser.id, {
        lastAuthenticatedAt: Timestamp.now(),
      });

      return {
        ...existingUser,
        lastAuthenticatedAt: Timestamp.now(),
      };
    }

    const user = createUserFactory(identity);

    return this.userRepository.create(user);
  }

  private getVerifiedIdentity(decodedToken: DecodedIdToken) {
    const email = decodedToken.email?.trim().toLowerCase();

    if (!email) {
      throw new ApplicationException(
        ErrorCode.UNAUTHENTICATED,
        HttpStatus.UNAUTHORIZED,
        'A verified email address is required to use StageGate',
      );
    }

    if (!decodedToken.email_verified) {
      throw new ApplicationException(
        ErrorCode.UNAUTHENTICATED,
        HttpStatus.UNAUTHORIZED,
        'A verified email address is required to use StageGate',
      );
    }

    return {
      firebaseUid: decodedToken.uid,
      email,
      displayName:
        typeof decodedToken.name === 'string' && decodedToken.name.trim()
          ? decodedToken.name.trim()
          : email,
      photoUrl:
        typeof decodedToken.picture === 'string'
          ? decodedToken.picture
          : undefined,
    };
  }

  private assertAllowedProvider(decodedToken: DecodedIdToken) {
    const provider = decodedToken.firebase.sign_in_provider;

    if (
      !provider ||
      !this.configService
        .get<string[]>('app.allowedProviders')
        ?.includes(provider)
    ) {
      throw new ApplicationException(
        ErrorCode.UNAUTHENTICATED,
        HttpStatus.UNAUTHORIZED,
        'This sign-in provider is not allowed.',
      );
    }
  }

  private assertUserCanAccessApplication(user: User): void {
    if (user.status === UserStatus.ACTIVE) {
      return;
    }

    throw new ApplicationException(
      ErrorCode.FORBIDDEN,
      HttpStatus.FORBIDDEN,
      'This account is not currently allowed to access the application',
    );
  }
}
