import { Injectable } from '@nestjs/common';

import { AppConfigService } from '../../config/services/appConfig.service';

interface FirebaseBaseConfig {
  projectId: string;
  healthTimeoutMs: number;
  healthCacheTtlMs: number;
}

export interface FirebaseEmulatorConfig extends FirebaseBaseConfig {
  mode: 'emulator';
  firestoreHost: string;
  authHost: string;
}

export interface FirebaseCloudConfig extends FirebaseBaseConfig {
  mode: 'cloud';
}

export type FirebaseRunTimeConfig = FirebaseEmulatorConfig | FirebaseCloudConfig;

@Injectable()
export class FirebaseConfig {
  constructor(private readonly config: AppConfigService) {}

  get value(): FirebaseRunTimeConfig {
    const base: FirebaseBaseConfig = {
      projectId: this.config.get('FIREBASE_PROJECT_ID'),
      healthTimeoutMs: this.config.get('FIREBASE_HEALTH_TIMEOUT_MS'),
      healthCacheTtlMs: this.config.get('FIREBASE_HEALTH_CACHE_TTL_MS'),
    };

    const mode = this.config.get('FIREBASE_MODE');

    if (mode === 'cloud') {
      return {
        ...base,
        mode: 'cloud',
      };
    }

    const firestoreHost = this.config.getOptional('FIRESTORE_EMULATOR_HOST');

    const authHost = this.config.getOptional('FIREBASE_AUTH_EMULATOR_HOST');

    if (!firestoreHost || !authHost) {
      throw new Error('Firebase emulator configuration is incomplete.');
    }

    return {
      ...base,
      mode: 'emulator',
      firestoreHost,
      authHost,
    };
  }
}
