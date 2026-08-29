import { Global, Module } from '@nestjs/common';
import { Auth, getAuth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import { App, AppOptions, applicationDefault, getApps, initializeApp } from 'firebase-admin/app';

import { RuntimeConfigService } from '../runtimeConfig/runtimeConfg.service';
import {
  FIRESTORE,
  FIREBASE_APP,
  FIREBASE_AUTH,
  FIREBASE_STORAGE,
} from '../runtimeConfig/firebase.tokens';

@Global()
@Module({
  providers: [
    {
      provide: FIREBASE_APP,
      inject: [RuntimeConfigService],
      useFactory: (config: RuntimeConfigService): App => {
        const existingApp = getApps().find((app) => app.name === config.serviceName);

        if (existingApp !== undefined) {
          return existingApp;
        }

        const options: AppOptions = {
          projectId: config.firebaseProjectId,
          storageBucket: config.firebaseStorageBucket,
        };

        if (!config.firebaseEmulatorsEnabled) {
          options.credential = applicationDefault();
        }

        return initializeApp(options, config.serviceName);
      },
    },
    {
      provide: FIREBASE_AUTH,
      inject: [FIREBASE_APP],
      useFactory: (app: App): Auth => getAuth(app),
    },
    {
      provide: FIRESTORE,
      inject: [FIREBASE_APP],
      useFactory: (app: App): Firestore => getFirestore(app),
    },
    {
      provide: FIREBASE_STORAGE,
      inject: [FIREBASE_APP],
      useFactory: (app: App): Storage => getStorage(app),
    },
  ],
  exports: [FIREBASE_APP, FIREBASE_AUTH, FIRESTORE, FIREBASE_STORAGE],
})
export class FirebaseAdminModule {}
