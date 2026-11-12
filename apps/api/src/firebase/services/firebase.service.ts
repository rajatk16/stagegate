import { Auth, getAuth } from 'firebase-admin/auth';
import { type Credential } from 'firebase-admin/app';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { getStorage, Storage } from 'firebase-admin/storage';
import { App, deleteApp, initializeApp } from 'firebase-admin';
import { Firestore, getFirestore } from 'firebase-admin/firestore';

const emulatorHosts = {
  FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',
  FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099',
  FIREBASE_STORAGE_EMULATOR_HOST: '127.0.0.1:9199',
};

const emulatorCredential: Credential = {
  async getAccessToken() {
    return { access_token: 'stagegate-emulator', expires_in: 3600 };
  },
};

@Injectable()
export class FirebaseService implements OnModuleDestroy {
  private app?: App;

  private get adminApp(): App {
    if (this.app) return this.app;

    if (
      process.env.STAGEGATE_FIREBASE_MODE !== 'emulator' ||
      process.env.NODE_ENV === 'production'
    ) {
      throw new Error('Firebase emulator mode requires explicit local opt-in');
    }

    for (const [name, expected] of Object.entries(emulatorHosts)) {
      if (process.env[name] !== expected) {
        throw new Error(`Expected ${name}-${expected}`);
      }
    }

    const storageHost = process.env.STORAGE_EMULATOR_HOST;
    if (storageHost && storageHost !== 'http://127.0.0.1:9199') {
      throw new Error('Unexpected Storage SDK emulator host');
    }

    this.app = initializeApp(
      {
        credential: emulatorCredential,
        projectId: 'demo-stagegate',
        storageBucket: 'demo-stagegate.appspot.com',
      },
      'stagegate-api',
    );
    return this.app;
  }

  get auth(): Auth {
    return getAuth(this.adminApp);
  }

  get firestore(): Firestore {
    return getFirestore(this.adminApp);
  }

  get storage(): Storage {
    return getStorage(this.adminApp);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.app) await deleteApp(this.app);
  }
}
