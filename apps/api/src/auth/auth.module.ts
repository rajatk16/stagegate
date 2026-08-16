import { Module } from '@nestjs/common';

import { UsersModule } from '@/users';

import { AuthService } from './services';
import { AuthController } from './controllers';

@Module({
  imports: [UsersModule],
  exports: [AuthService],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
