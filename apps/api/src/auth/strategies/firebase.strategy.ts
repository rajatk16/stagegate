import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';

import { FirebaseService } from '@/firebase/firebase.service';

@Injectable()
export class FirebaseStrategy {
  constructor(private readonly firebaseService: FirebaseService) {}

  async validate(token: string): Promise<admin.auth.DecodedIdToken> {
    return this.firebaseService.auth.verifyIdToken(token);
  }
}
