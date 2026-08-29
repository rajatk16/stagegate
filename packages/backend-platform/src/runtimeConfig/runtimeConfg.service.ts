import { ConfigService } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';

import type { RuntimeEnvironment } from './environment.schema';

export const RUNTIME_CONFIG_OPTIONS = Symbol('RUNTIME_CONFIG_OPTIONS');

export interface RuntimeConfigOptions {
  serviceName: string;
  defaultPort: number;
  envFilePaths: string[];
}

@Injectable()
export class RuntimeConfigService {
  constructor(
    private readonly configService: ConfigService<RuntimeEnvironment, true>,
    @Inject(RUNTIME_CONFIG_OPTIONS)
    private readonly options: RuntimeConfigOptions,
  ) {}

  get serviceName(): string {
    return this.options.serviceName;
  }

  get appEnvironment(): RuntimeEnvironment['APP_ENV'] {
    return this.configService.get('APP_ENV', { infer: true });
  }

  get port(): number {
    return this.configService.get('PORT', { infer: true });
  }

  get firebaseProjectId(): string {
    return this.configService.get('FIREBASE_PROJECT_ID', { infer: true });
  }

  get firebaseStorageBucket(): string {
    return this.configService.get('FIREBASE_STORAGE_BUCKET', { infer: true });
  }

  get firebaseEmulatorsEnabled(): boolean {
    return (
      this.configService.get('FIREBASE_AUTH_EMULATOR_HOST', { infer: true }) !== undefined &&
      this.configService.get('FIRESTORE_EMULATOR_HOST', { infer: true }) !== undefined &&
      this.configService.get('FIREBASE_STORAGE_EMULATOR_HOST', { infer: true }) !== undefined
    );
  }
}
