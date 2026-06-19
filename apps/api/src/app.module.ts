import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { LoggerModule } from '@/logger/logger.module';
import { HealthModule } from '@/health/health.module';
import firebaseConfig from '@/config/firebase.config';
import { FirebaseModule } from '@/firebase/firebase.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [firebaseConfig],
    }),
    LoggerModule,
    CommonModule,
    FirebaseModule,
    HealthModule,
  ],
})
export class AppModule {}
