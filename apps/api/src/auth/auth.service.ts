import { DecodedIdToken } from 'firebase-admin/auth';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { FirebaseService } from '@/firebase/firebase.service';
import { UserRepository } from '@/users/repositories/user.repository';
import { createUserFactory } from '@/users/util/createUser.factory';

@Injectable()
export class AuthService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly userRepository: UserRepository,
  ) {}

  async verifyToken(token: string): Promise<DecodedIdToken> {
    try {
      return await this.firebaseService.auth.verifyIdToken(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
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
