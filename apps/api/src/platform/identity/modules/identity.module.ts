import { Module } from '@nestjs/common';

import { IdentityService } from '../services';
import { UsersController } from '../controllers';
import { IdentityExceptionFilter } from '../filters';
import { IdentityRepository, UserProfileRepository } from '../repositories';

@Module({
  controllers: [UsersController],
  providers: [
    IdentityService,
    IdentityExceptionFilter,
    {
      provide: UserProfileRepository,
      useClass: IdentityRepository,
    },
  ],
})
export class IdentityModule {}
