import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Environment } from '../schemas/env.schema';

type RequiredEnvironmentKey = {
  [K in keyof Environment]-?: undefined extends Environment[K] ? never : K;
}[keyof Environment];

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<Environment, true>) {}

  get<K extends RequiredEnvironmentKey>(key: K): Environment[K] {
    return this.config.getOrThrow(key, {
      infer: true,
    });
  }

  getOptional<K extends keyof Environment>(key: K): Environment[K] | undefined {
    return this.config.get(key, {
      infer: true,
    });
  }

  get isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  get isTest(): boolean {
    return this.get('NODE_ENV') === 'test';
  }
}
