/// <reference types="vite/client" />

interface ViteTypeOptions {
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_ENV: 'local' | 'test' | 'development' | 'staging' | 'production';
  readonly VITE_API_BASE_URL: string;

  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_USE_AUTH_EMULATOR: 'true' | 'false';
  readonly VITE_FIREBASE_AUTH_EMULATOR_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
