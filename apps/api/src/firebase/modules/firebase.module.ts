import { Module } from '@nestjs/common';

import { AppConfigModule } from '../../config/modules/appConfig.module';
import { FirebaseConfig } from '../config/firebase.config';
import { FIREBASE_APP, FIREBASE_AUTH, FIRESTORE } from '../constants/firebase.constants';
import {
  firebaseAppProvider,
  firebaseAuthProvider,
  firebaseServiceProvider,
  firestoreProvider,
} from '../providers/firebase.provider';
import { FirebaseService } from '../services/firebase.service';
import { FirebaseHealthService } from '../services/firebaseHealth.service';

@Module({
  imports: [AppConfigModule],
  providers: [
    FirebaseConfig,
    firebaseServiceProvider,
    firebaseAppProvider,
    firestoreProvider,
    firebaseAuthProvider,
    FirebaseHealthService,
  ],
  exports: [FirebaseService, FirebaseHealthService, FIREBASE_APP, FIRESTORE, FIREBASE_AUTH],
})
export class FirebaseModule {}
