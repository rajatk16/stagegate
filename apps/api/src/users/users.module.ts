import { Module } from '@nestjs/common';

import { UserRepository } from './repositories';

@Module({
  exports: [UserRepository],
  providers: [UserRepository],
})
export class UsersModule {}
