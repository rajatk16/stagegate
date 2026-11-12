import { Module } from '@nestjs/common';

import { ProfilesService } from '../services/profiles.service';
import { ProfilesController } from '../controller/profiles.controller';
import { FirebaseModule } from '../../firebase/modules/firebase.module';
import { IdentityModule } from '../../identity/modules/identity.module';
import { ProfilesRepository } from '../repositories/profiles.repository';
import { ApiExceptionFilter } from '../../common/filters/apiException.filter';

@Module({
  controllers: [ProfilesController],
  imports: [FirebaseModule, IdentityModule],
  providers: [ApiExceptionFilter, ProfilesService, ProfilesRepository],
})
export class ProfilesModule {}
