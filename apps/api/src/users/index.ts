import { Module } from '@nestjs/common';

import { AuditModule } from '../audit';
import { UsersService } from './services';
import { FirebaseModule } from '../firebase';
import { UsersController } from './controllers';
import { UsersRepository } from './repositories';

@Module({
  exports: [UsersService],
  controllers: [UsersController],
  imports: [FirebaseModule, AuditModule],
  providers: [UsersService, UsersRepository],
})
export class UsersModule {}
