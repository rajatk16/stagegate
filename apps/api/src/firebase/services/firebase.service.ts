import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import {
  applicationDefault,
  AppOptions,
  deleteApp,
  getApps,
  initializeApp,
  type App,
} from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

import { FirebaseConfig } from '../config/firebase.config';
import { FIREBASE_APP_NAME } from '../constants/firebase.constants';

@Injectable()
export class FirebaseService implements OnApplicationShutdown {
  private readonly logger = new Logger(FirebaseService.name);

  private application: App | undefined;

  private firestoreInstance: Firestore | undefined;

  private authInstance: Auth | undefined;

  private shutdownPromise: Promise<void> | undefined;

  constructor(private readonly config: FirebaseConfig) {}

  async initialize(): Promise<void> {
    if (this.shutdownPromise) {
      throw new Error('Firebase service is shutting down.');
    }

    if (this.application) {
      return;
    }

    const configuration = this.config.value;

    this.verifyProcessEnvironment();

    const existingApplication = getApps().find((app) => app.name === FIREBASE_APP_NAME);

    if (existingApplication) {
      throw new Error('A Firebase application with the StageGate name already exists.');
    }

    const options: AppOptions = {
      projectId: configuration.projectId,
      ...(configuration.mode === 'cloud'
        ? {
            credential: applicationDefault(),
          }
        : {}),
    };

    const application = initializeApp(options, FIREBASE_APP_NAME);

    this.application = application;

    try {
      const firestore = getFirestore(application);

      firestore.settings({
        ignoreUndefinedProperties: false,
      });

      this.firestoreInstance = firestore;

      this.authInstance = getAuth(application);

      this.logger.log(`Firebase initialized: mode=${configuration.mode}`);
    } catch (error) {
      try {
        await this.shutdown();
      } catch {
        this.logger.error('Firebase cleanup failed after initialization error.');
      }
      throw error;
    }
  }

  get app(): App {
    if (!this.application) {
      throw new Error('Firebase application is not initialized.');
    }

    return this.application;
  }

  get firestore(): Firestore {
    if (!this.firestoreInstance) {
      throw new Error('Firestore is not initialized');
    }

    return this.firestoreInstance;
  }

  get auth(): Auth {
    if (!this.authInstance) {
      throw new Error('Firebase Auth is not initialized.');
    }

    return this.authInstance;
  }

  get isInitialized(): boolean {
    return (
      this.application !== undefined &&
      this.firestoreInstance !== undefined &&
      this.authInstance !== undefined &&
      this.shutdownPromise === undefined
    );
  }

  async onApplicationShutdown() {
    await this.shutdown();
  }

  shutdown(): Promise<void> {
    this.shutdownPromise ??= this.disposeResources();

    return this.shutdownPromise;
  }

  private verifyProcessEnvironment(): void {
    const configuration = this.config.value;

    const firestoreHost = process.env['FIRESTORE_EMULATOR_HOST'];

    const authHost = process.env['FIREBASE_AUTH_EMULATOR_HOST'];

    if (configuration.mode === 'emulator') {
      if (!configuration.projectId.startsWith('demo-')) {
        throw new Error('Emulator mode requires a demo project.');
      }

      if (firestoreHost !== configuration.firestoreHost) {
        throw new Error(
          'Firestore emulator process environment does not match validated configuration.',
        );
      }

      if (authHost !== configuration.authHost) {
        throw new Error(
          'Firebase Auth emulator process environment does not match validated configuration.',
        );
      }

      return;
    }

    if (firestoreHost !== undefined || authHost !== undefined) {
      throw new Error('Firebase emulator variables are forbidden in cloud mode.');
    }
  }

  private async disposeResources(): Promise<void> {
    const application = this.application;

    this.application = undefined;
    this.firestoreInstance = undefined;
    this.authInstance = undefined;

    if (!application) {
      return;
    }

    await deleteApp(application);

    this.logger.log('Firebase application disposed.');
  }
}
