import { ConfigService } from '@nestjs/config';
import { Auth, getAuth } from 'firebase-admin/auth';
import { getStorage, type Storage } from 'firebase-admin/storage';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import {
  App,
  deleteApp,
  initializeApp,
  applicationDefault,
} from 'firebase-admin';

import { Environment } from '../../config';

@Injectable()
export class FirebaseService implements OnApplicationShutdown {
  private readonly logger = new Logger(FirebaseService.name);
  private readonly app: App;

  readonly auth: Auth;
  readonly storage: Storage;
  readonly firestore: Firestore;

  constructor(config: ConfigService<Environment, true>) {
    const mode = config.getOrThrow('FIREBASE_MODE', { infer: true });
    const projectId = config.getOrThrow('FIREBASE_PROJECT_ID', {
      infer: true,
    });
    const storageBucket = config.getOrThrow('FIREBASE_STORAGE_BUCKET', {
      infer: true,
    });

    if (mode === 'emulator') {
      const host = config.getOrThrow('FIRESTORE_EMULATOR_HOST', {
        infer: true,
      });

      process.env.FIRESTORE_EMULATOR_HOST = host;
      process.env.FIREBASE_AUTH_EMULATOR_HOST = config.getOrThrow(
        'FIREBASE_AUTH_EMULATOR_HOST',
        { infer: true },
      );
      process.env.FIREBASE_STORAGE_EMULATOR_HOST = config.getOrThrow(
        'FIREBASE_STORAGE_EMULATOR_HOST',
        { infer: true },
      );

      this.app = initializeApp({ projectId, storageBucket }, 'stagegate-api');

      this.logger.log(
        `Firestore configured for emulator ${host}, project ${projectId}`,
      );
    } else {
      this.app = initializeApp(
        {
          projectId,
          storageBucket,
          credential: applicationDefault(),
        },
        'stagegate-api',
      );

      this.logger.log(`Firestore configured for live project ${projectId}`);
    }

    this.auth = getAuth(this.app);
    this.storage = getStorage(this.app);
    this.firestore = getFirestore(this.app);
  }

  async onApplicationShutdown(): Promise<void> {
    try {
      try {
        await this.firestore.terminate();
      } finally {
        await deleteApp(this.app);
      }

      this.logger.log({
        event: 'firebase.shutdown.completed',
      });
    } catch {
      this.logger.error({
        event: 'firebase.shutdown.failed',
      });

      process.exitCode = 1;
    }
  }
}
