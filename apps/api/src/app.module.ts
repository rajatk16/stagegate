import { Module } from '@nestjs/common';

import { FirebaseModule } from './firebase/modules/firebase.module';
import { IdentityModule } from './identity/modules/identity.module';
import { ProfilesModule } from './profiles/modules/profiles.module';
import { OrganizationsModule } from './organizations/modules/organizations.module';

@Module({
  imports: [
    FirebaseModule,
    IdentityModule,
    ProfilesModule,
    OrganizationsModule,
  ],
})
export class AppModule {}
