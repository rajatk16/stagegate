import { FirebaseConfig } from '../config/firebase.config';
import { FIREBASE_APP, FIREBASE_AUTH, FIRESTORE } from '../constants/firebase.constants';
import { FirebaseService } from '../services/firebase.service';

import type { Provider } from '@nestjs/common';
import type { App } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';

export const firebaseServiceProvider: Provider<FirebaseService> = {
  provide: FirebaseService,
  inject: [FirebaseConfig],
  useFactory: async (config: FirebaseConfig): Promise<FirebaseService> => {
    const service = new FirebaseService(config);

    await service.initialize();

    return service;
  },
};

export const firebaseAppProvider: Provider<App> = {
  provide: FIREBASE_APP,
  inject: [FirebaseService],
  useFactory: (firebase: FirebaseService): App => firebase.app,
};

export const firestoreProvider: Provider<Firestore> = {
  provide: FIRESTORE,
  inject: [FirebaseService],
  useFactory: (firebase: FirebaseService) => firebase.firestore,
};

export const firebaseAuthProvider: Provider<Auth> = {
  provide: FIREBASE_AUTH,
  inject: [FirebaseService],
  useFactory: (firebase: FirebaseService): Auth => firebase.auth,
};
