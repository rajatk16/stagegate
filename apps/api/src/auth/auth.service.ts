import { DecodedIdToken } from 'firebase-admin/auth';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { UserRepository } from '@/users/repositories';
import { createUserFactory } from '@/users/factories';
import { FirebaseService } from '@/firebase/firebase.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly firebaseService: FirebaseService,
  ) {}

  async verifyToken(token: string): Promise<DecodedIdToken> {
    try {
      return await this.firebaseService.auth.verifyIdToken(token);
    } catch {
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }

  async getOrCreateUser(decodedToken: DecodedIdToken) {
    let user = await this.userRepository.findByFirebaseUid(decodedToken.uid);

    if (user) {
      return user;
    }

    user = createUserFactory({
      firebaseUid: decodedToken.uid,
      email: decodedToken.email!,
      displayName: (decodedToken.name as string) ?? decodedToken.email!,
      photoUrl: decodedToken.picture,
    });

    return this.userRepository.create(user);
  }
}
