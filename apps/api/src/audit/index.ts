import { Module } from '@nestjs/common';

import { AuditWriter } from './services';
import { FirebaseModule } from '../firebase';

@Module({
  exports: [AuditWriter],
  providers: [AuditWriter],
  imports: [FirebaseModule],
})
export class AuditModule {}

export * from './enums';
export * from './types';
export * from './models';
export * from './mappers';
export * from './services';
export * from './converters';