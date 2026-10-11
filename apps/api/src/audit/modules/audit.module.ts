import { Module } from '@nestjs/common';

import { AuditWriter } from '../services';
import { FirebaseModule } from '../../firebase/module/firebase.module';

@Module({
  exports: [AuditWriter],
  providers: [AuditWriter],
  imports: [FirebaseModule],
})
export class AuditModule {}
