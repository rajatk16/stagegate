import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { InvitationsService } from '../services/invitations.service';
import { AuditModule } from '../../audit/modules/audit.module';
import { EmailModule } from '../../email/modules/email.module';
import { InvitationsController } from '../controllers/invitations.controller';
import { FirebaseModule } from '../../firebase/module/firebase.module';
import { InvitationsRepository } from '../repositories/invitations.repository';
import { OrganizationPersistenceModule } from '../../organizations/modules/organizationPersistence.module';

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
