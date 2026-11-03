import { Module } from '@nestjs/common';

import { UsersService } from '../services/users.service';
import { UsersController } from '../controllers/users.controller';
import { UsersRepository } from '../repositories/users.repository';
import { AuditModule } from '../../audit/modules/audit.module';
import { FirebaseModule } from '../../firebase/module/firebase.module';

@Module({
  exports: [UsersService],
  controllers: [UsersController],
  imports: [FirebaseModule, AuditModule],
  providers: [UsersService, UsersRepository],
})
export class UsersModule {}
