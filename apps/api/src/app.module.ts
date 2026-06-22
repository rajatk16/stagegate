import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

import appConfig from '@/config/app.config';
import { AuthModule } from '@/auth/auth.module';
import { UsersModule } from '@/users/users.module';
import { LoggerModule } from '@/logger/logger.module';
import { HealthModule } from '@/health/health.module';
import { CommonModule } from '@/common/common.module';
import firebaseConfig from '@/config/firebase.config';
import { FirebaseModule } from '@/firebase/firebase.module';
import { FirebaseAuthGuard } from '@/auth/guards/firebaseAuth.guard';
import { AuthorizationModule } from '@/authorization/authorization.module';
import { OrganizationsModule } from '@/organizations/organizations.module';
import { AuthorizationGuard } from '@/authorization/guards/authorization.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [firebaseConfig, appConfig],
    }),
    LoggerModule,
    CommonModule,
    FirebaseModule,
    HealthModule,
    UsersModule,
    AuthModule,
    AuthorizationModule,
    OrganizationsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard,
    },
  ],
})
export class AppModule {}
