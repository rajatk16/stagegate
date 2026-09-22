import { ConfigService } from "@nestjs/config";
import { Auth, getAuth } from "firebase-admin/auth";
import { Firestore, getFirestore } from "firebase-admin/firestore";
import { Injectable, Logger, OnApplicationShutdown } from "@nestjs/common";
import { App, applicationDefault, deleteApp, initializeApp } from "firebase-admin";

import { Environment } from "../../config";

@Injectable()
export class FirebaseService implements OnApplicationShutdown {
  private readonly logger = new Logger(FirebaseService.name);
  private readonly app: App;

  readonly auth: Auth;
  readonly firestore: Firestore;

  constructor(config: ConfigService<Environment, true>) {
    const mode = config.getOrThrow('FIREBASE_MODE', { infer: true });
    const projectId = config.getOrThrow('FIREBASE_PROJECT_ID', {
      infer: true
    });

    if (mode === 'emulator') {
      const host = config.getOrThrow('FIRESTORE_EMULATOR_HOST', {
        infer: true
      });

      process.env.FIRESTORE_EMULATOR_HOST = host;
      process.env.FIREBASE_AUTH_EMULATOR_HOST = config.getOrThrow('FIREBASE_AUTH_EMULATOR_HOST', { infer: true });

      this.app = initializeApp(
        { projectId },
        'stagegate-api'
      );

      this.logger.log(`Firestore configured for emulator ${host}, project ${projectId}`);
    } else {
      this.app = initializeApp(
        {
          projectId,
          credential: applicationDefault(),
        },
        'stagegate-api'
      );

      this.logger.log(`Firestore configured for live project ${projectId}`);
    }

    this.auth = getAuth(this.app);
    this.firestore = getFirestore(this.app);
  }

  async onApplicationShutdown(): Promise<void> {
    try {
      await this.firestore.terminate();
    } finally {
      await deleteApp(this.app);
    }
  }
}