import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService {
  private app: admin.app.App;

  constructor(private readonly configService: ConfigService) {
    this.initialize();
  }

  private initialize() {
    if (admin.apps.length > 0) {
      this.app = admin.app();
      return;
    }

    this.app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: this.configService.getOrThrow<string>('firebase.projectId'),
        clientEmail: this.configService.getOrThrow<string>(
          'firebase.clientEmail',
        ),
        privateKey: this.configService.getOrThrow<string>(
          'firebase.privateKey',
        ),
      }),
    });
  }

  get firestore() {
    return admin.firestore(this.app);
  }

  get auth(): admin.auth.Auth {
    return admin.auth(this.app);
  }

  getFirestore() {
    return this.firestore;
  }
}
