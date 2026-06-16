import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validateEnv } from './config/validateEnv';

import { HealthModule } from '@/health/health.module';
import { FirebaseModule } from '@/firebase/firebase.module';
import { AuthModule } from './auth/auth.module';

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
  ],
})
export class AppModule {}
