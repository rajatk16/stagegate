import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { InvitationsService } from '../services';
import { InvitationsController } from '../controllers';
import { InvitationsRepository } from '../repositories';
import { AuditModule } from '../../audit/modules/audit.module';
import { EmailModule } from '../../email/modules/email.module';
import { FirebaseModule } from '../../firebase/module/firebase.module';
import { OrganizationPersistenceModule } from '../../organizationPersistence/modules';

@Module({
  exports: [InvitationsService],
  controllers: [InvitationsController],
  providers: [InvitationsRepository, InvitationsService],
  imports: [
    AuditModule,
    EmailModule,
    ConfigModule,
    FirebaseModule,
    OrganizationPersistenceModule,
  ],
})
export class InvitationsModule {}
