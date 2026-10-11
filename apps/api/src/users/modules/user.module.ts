import { Module } from '@nestjs/common';

import { UsersService } from '../services';
import { UsersController } from '../controllers';
import { UsersRepository } from '../repositories';
import { AuditModule } from '../../audit/modules/audit.module';
import { FirebaseModule } from '../../firebase/module/firebase.module';

@Module({
  exports: [UsersService],
  controllers: [UsersController],
  imports: [FirebaseModule, AuditModule],
  providers: [UsersService, UsersRepository],
})
export class UsersModule {}
