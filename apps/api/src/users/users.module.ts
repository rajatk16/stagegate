import { Module } from '@nestjs/common';

import { UsersService } from './services';
import { UserRepository } from './repositories';

@Module({
  exports: [UserRepository, UsersService],
  providers: [UserRepository, UsersService],
})
export class UsersModule {}
