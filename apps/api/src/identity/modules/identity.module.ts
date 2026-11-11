import { Module } from '@nestjs/common';

import { IdentityService } from '../services/identity.service';
import { UsersRepository } from '../repositories/users.repository';
import { ActiveIdentityGuard } from '../guards/activeIdentity.guard';
import { FirebaseModule } from '../../firebase/modules/firebase.module';
import { IdentityController } from '../controllers/identity.controller';
import { FirebaseIdentityGuard } from '../guards/firebaseIdentity.guard';
import { ApiExceptionFilter } from '../../common/filters/apiException.filter';
import { IdentityMappingsRepository } from '../repositories/identityMappings.repository';

@Module({
  imports: [FirebaseModule],
  controllers: [IdentityController],
  exports: [FirebaseIdentityGuard, ActiveIdentityGuard, IdentityService],
  providers: [
    IdentityService,
    UsersRepository,
    ApiExceptionFilter,
    ActiveIdentityGuard,
    FirebaseIdentityGuard,
    IdentityMappingsRepository,
  ],
})
export class IdentityModule {}
