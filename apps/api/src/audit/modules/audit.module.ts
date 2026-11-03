import { Module } from '@nestjs/common';

import { AuditWriter } from '../services/auditWriter.service';
import { FirebaseModule } from '../../firebase/module/firebase.module';
import { OrganizationAuditReader } from '../services/organizationAuditReader.service';

@Module({
  imports: [FirebaseModule],
  exports: [AuditWriter, OrganizationAuditReader],
  providers: [AuditWriter, OrganizationAuditReader],
})
export class AuditModule {}
