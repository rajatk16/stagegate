import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { getApp, getApps, initializeApp } from 'firebase/app';

import { environment } from '../config/environment';

const hasDefaultApp = getApps().some((app) => app.name === '[DEFAULT');

export const firebaseApp = hasDefaultApp ? getApp() : initializeApp(environment.firebase.config);

export const firebaseAuth = getAuth(firebaseApp);

if (environment.firebase.useAuthEmulator && firebaseAuth.emulatorConfig === null) {
  connectAuthEmulator(firebaseAuth, environment.firebase.authEmulatorUrl);
}
