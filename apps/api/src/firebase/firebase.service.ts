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

    const useEmulator =
      this.configService.get<boolean>('firebase.useEmulator') === true;

    if (useEmulator) {
      const firestoreEmulatorHost = this.configService.get<string>(
        'firebase.firestoreEmulatorHost',
      );
      const authEmulatorHost = this.configService.get<string>(
        'firebase.authEmulatorHost',
      );

      if (firestoreEmulatorHost) {
        process.env.FIRESTORE_EMULATOR_HOST = firestoreEmulatorHost;
      }
      if (authEmulatorHost) {
        process.env.FIREBASE_AUTH_EMULATOR_HOST = authEmulatorHost;
      }

      this.app = admin.initializeApp({
        projectId: this.configService.get<string>('firebase.projectId'),
      });
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
}
