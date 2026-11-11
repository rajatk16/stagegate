import { getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth';

export const initializeStageGateAuth = (): Auth | null => {
  const mode = import.meta.env.VITE_FIREBASE_MODE;
  const emulator = mode === 'emulator' && import.meta.env.DEV;
  const options = emulator
    ? {
        apiKey: 'demo-key',
        projectId: 'demo-stagegate',
      }
    : {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as
          string | undefined,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as
          string | undefined,
        appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
      };

  if (
    !emulator &&
    (mode !== 'cloud' || Object.values(options).some((value) => !value))
  ) {
    return null;
  }

  const name = 'stagegate-web';
  const app =
    getApps().find((candidate) => candidate.name === name) ??
    initializeApp(options, name);
  const auth = getAuth(app);
  if (emulator && !auth.emulatorConfig) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', {
      disableWarnings: true,
    });
  }
  return auth;
};
