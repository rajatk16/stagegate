import { Module } from '@nestjs/common';

import { AuditWriter, OrganizationAuditReader } from '../services';
import { FirebaseModule } from '../../firebase/module/firebase.module';

@Module({
  imports: [FirebaseModule],
  exports: [AuditWriter, OrganizationAuditReader],
  providers: [AuditWriter, OrganizationAuditReader],
})
export class AuditModule {}
