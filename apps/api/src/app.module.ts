import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '@/auth/auth.module';
import { UsersModule } from '@/users/users.module';
import { LoggerModule } from '@/logger/logger.module';
import { HealthModule } from '@/health/health.module';
import { CommonModule } from '@/common/common.module';
import firebaseConfig from '@/config/firebase.config';
import { FirebaseModule } from '@/firebase/firebase.module';
import { FirebaseAuthGuard } from '@/auth/guards/firebaseAuth.guard';

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
    UsersModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
  ],
})
export class AppModule {}
