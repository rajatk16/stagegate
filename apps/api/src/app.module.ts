import { Module } from '@nestjs/common';

import { FirebaseModule } from './firebase/modules/firebase.module';
import { IdentityModule } from './identity/modules/identity.module';
import { OrganizationsModule } from './organizations/modules/organizations.module';

@Module({
  imports: [IdentityModule, FirebaseModule, OrganizationsModule],
})
export class AppModule {}
