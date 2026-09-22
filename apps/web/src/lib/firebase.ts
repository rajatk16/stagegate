import {getApps, initializeApp} from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim();
const emulatorUrl = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL?.trim();

if (!projectId || !projectId.startsWith("demo-")) {
  throw new Error(
    "Local Firebase Auth requires a VITE_FIREBASE_PROJECT_ID starting with demo-."
  );
}

if (!emulatorUrl) {
  throw new Error('VITE_FIREBASE_AUTH_EMULATOR_URL is required.');
}

const endpoint = new URL(emulatorUrl);

if (
  endpoint.protocol !== "http:" || 
  !["127.0.0.1", "locahost"].includes(endpoint.hostname) ||
  endpoint.pathname !== '/' ||
  endpoint.search ||
  endpoint.hash ||
  endpoint.username ||
  endpoint.password
) {
  throw new Error(
    "Use a local Auth emulator URL such as http://127.0.0.1:9099"
  );
}

const appName = "stagegate-web";

const firebaseApp = getApps().find((app) => app.name === appName) ?? initializeApp(
  {
    projectId,
    apiKey: "demo-stagegate-api-key"
  },
  appName
);

export const firebaseAuth = getAuth(firebaseApp);

if (!firebaseAuth.emulatorConfig) {
  connectAuthEmulator(firebaseAuth, endpoint.origin);
}
