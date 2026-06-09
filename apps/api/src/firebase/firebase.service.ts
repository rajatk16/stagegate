import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService {
  private readonly app: admin.app.App;

  constructor(private readonly configService: ConfigService) {
    this.app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: this.configService.getOrThrow('FIREBASE_PROJECT_ID'),
        clientEmail: this.configService.getOrThrow('FIREBASE_CLIENT_EMAIL'),
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }

  get auth(): admin.auth.Auth {
    return this.app.auth();
  }

  get firestore(): admin.firestore.Firestore {
    return this.app.firestore();
  }
}
