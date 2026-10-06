import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuditModule } from '../audit';
import { EmailModule } from '../email';
import { FirebaseModule } from '../firebase';
import { InvitationsService } from './services';
import { InvitationsController } from './controllers';
import { InvitationsRepository } from './repositories';

@Module({
  controllers: [InvitationsController],
  providers: [InvitationsRepository, InvitationsService],
  imports: [ConfigModule, FirebaseModule, AuditModule, EmailModule],
})
export class InvitationsModule {}

export * from './dtos';
export * from './types';
export * from './utils';
export * from './models';
export * from './mappers';
export * from './services';
export * from './constants';
export * from './converters';
export * from './repositories';
