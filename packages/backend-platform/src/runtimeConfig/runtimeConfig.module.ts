import { DynamicModule, Global, Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';

import {
  RuntimeConfigOptions,
  RuntimeConfigService,
  RUNTIME_CONFIG_OPTIONS,
} from './runtimeConfg.service';
import { validateEnvironment } from './environment.schema';

@Global()
@Module({})
export class RuntimeConfigModule {
  static forRoot(options: RuntimeConfigOptions): DynamicModule {
    return {
      global: true,
      module: RuntimeConfigModule,
      exports: [RuntimeConfigService],
      providers: [
        {
          provide: RUNTIME_CONFIG_OPTIONS,
          useValue: options,
        },
        RuntimeConfigService,
      ],
      imports: [
        ConfigModule.forRoot({
          cache: true,
          expandVariables: false,
          envFilePath: options.envFilePaths,
          validate: (values: Record<string, unknown>) =>
            validateEnvironment(values, options.defaultPort),
        }),
      ],
    };
  }
}
