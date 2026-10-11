import { ConfigModule } from '@nestjs/config';
import { Module, forwardRef } from '@nestjs/common';

import { InvitationsService } from '../services';
import { InvitationsController } from '../controllers';
import { OrganizationModule } from '../../organizations/modules/organization.module';
import { InvitationsRepository } from '../repositories';
import { AuditModule } from '../../audit/modules/audit.module';
import { EmailModule } from '../../email/modules/email.module';
import { FirebaseModule } from '../../firebase/module/firebase.module';

@Module({
  controllers: [InvitationsController],
  providers: [InvitationsRepository, InvitationsService],
  imports: [
    ConfigModule,
    FirebaseModule,
    AuditModule,
    EmailModule,
    forwardRef(() => OrganizationModule),
  ],
  exports: [InvitationsService],
})
export class InvitationsModule {}
