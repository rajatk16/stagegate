import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseProvider {
  readonly app: admin.app.App;
  readonly firestore: admin.firestore.Firestore;

  constructor(private configService: ConfigService) {
    this.app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: this.configService.getOrThrow('FIREBASE_PROJECT_ID'),
        clientEmail: this.configService.getOrThrow('FIREBASE_CLIENT_EMAIL'),
        privateKey: this.configService
          .getOrThrow<string>('FIREBASE_PRIVATE_KEY')
          ?.replace(/\\n/g, '\n'),
      }),
    });

    this.firestore = admin.firestore(this.app);
  }
}
