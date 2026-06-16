import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validateEnv } from './config/validateEnv';

import { AuthModule } from '@/auth/auth.module';
import { LoggerModule } from '@/logger/logger.module';
import { HealthModule } from '@/health/health.module';
import { CommonModule } from '@/common/common.module';
import { FirebaseModule } from '@/firebase/firebase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: ['.env.local', '.env'],
    }),
    FirebaseModule,
    HealthModule,
    AuthModule,
    LoggerModule,
    CommonModule,
  ],
})
export class AppModule {}
