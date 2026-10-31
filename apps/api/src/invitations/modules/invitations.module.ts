import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { InvitationsService } from '../services';
import { AuditModule } from '../../audit/modules';
import { EmailModule } from '../../email/modules';
import { InvitationsController } from '../controllers';
import { FirebaseModule } from '../../firebase/module';
import { InvitationsRepository } from '../repositories';
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
