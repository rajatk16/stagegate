import { Module } from '@nestjs/common';

import { UserRepository } from './repositories/user.repository';

@Module({
  exports: [UserRepository],
  providers: [UserRepository],
})
export class UsersModule {}
