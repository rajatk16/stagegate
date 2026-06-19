import { registerAs } from '@nestjs/config';

export default registerAs('firebase', () => ({
  projectId: process.env.FIREBASE_PROJECT_ID,
  useEmulator: process.env.FIREBASE_USE_EMULATOR === 'true',
  firestoreEmulatorHost: process.env.FIRESTORE_EMULATOR_HOST,
  authEmulatorHost: process.env.FIREBASE_AUTH_EMULATOR_HOST,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}));
