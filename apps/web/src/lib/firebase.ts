import { FirebaseOptions, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";

const required = (value: string | undefined, name: string): string => {
  const result = value?.trim();

  if (!result) {
    throw new Error(`${name} is required.`);
  }

  return result;
};

const mode =
  import.meta.env.VITE_FIREBASE_MODE?.trim() ??
  (import.meta.env.DEV ? "emultator" : "live");

if (mode !== "emulator" && mode !== "live") {
  throw new Error("VITE_FIREBASE_MODE must be emulator or live");
}

const projectId = required(
  import.meta.env.VITE_FIREBASE_PROJECT_ID,
  "VITE_FIREBASE_PROJECT_ID",
);

const emulatorUrl = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL?.trim();

let options: FirebaseOptions;
let emulatorOrigin: string | undefined;

if (mode === "emulator") {
  if (import.meta.env.PROD) {
    throw new Error("Production builds require live Firebase");
  }

  if (!projectId.startsWith("demo-")) {
    throw new Error("Emulator mode requires a demo- project.");
  }

  const endpoint = new URL(
    required(emulatorUrl, "VITE_FIREBASE_AUTH_EMULATOR_URL"),
  );

  if (
    endpoint.protocol !== "http:" ||
    !["127.0.0.1", "locahost"].includes(endpoint.hostname) ||
    endpoint.pathname !== "/" ||
    endpoint.search ||
    endpoint.hash ||
    endpoint.username ||
    endpoint.password
  ) {
    throw new Error("Use a local Firebase Auth emulator URL.");
  }

  emulatorOrigin = endpoint.origin;

  options = {
    projectId,
    apiKey: "demo-stagegate-api-key",
  };
} else {
  if (projectId.startsWith("demo-")) {
    throw new Error("Live Firebase requires a real project.");
  }

  if (emulatorUrl) {
    throw new Error("Remove emulator configuration in live mode.");
  }

  const apiUrl = new URL(
    required(import.meta.env.VITE_API_BASE_URL, "VITE_API_BASE_URL"),
  );

  if (
    apiUrl.protocol !== "https:" ||
    apiUrl.username ||
    apiUrl.password ||
    apiUrl.search ||
    apiUrl.hash
  ) {
    throw new Error("Live mode requires an HTTPS API base URL");
  }

  options = {
    projectId,
    apiKey: required(
      import.meta.env.VITE_FIREBASE_API_KEY,
      "VITE_FIREBASE_API_KEY",
    ),
    authDomain: required(
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      "VITE_FIREBASE_AUTH_DOMAIN",
    ),
    appId: required(
      import.meta.env.VITE_FIREBASE_APP_ID,
      "VITE_FIREBASE_APP_ID",
    ),
  };
}

const appName = "stagegate-web";

const firebaseApp =
  getApps().find((app) => app.name === appName) ??
  initializeApp(options, appName);

export const firebaseAuth = getAuth(firebaseApp);

if (emulatorOrigin && !firebaseAuth.emulatorConfig) {
  connectAuthEmulator(firebaseAuth, emulatorOrigin);
}
