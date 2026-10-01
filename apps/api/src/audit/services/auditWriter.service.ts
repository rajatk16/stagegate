import { Injectable } from '@nestjs/common';
import { Transaction } from 'firebase-admin/firestore';

import { AuditEvent } from '../models';
import { ProfileField } from '../enums';
import { auditEventConverter } from '../converters';
import {
  toOrganizationCreatedAuditEvent,
  toProfileUpdatedAuditEvent,
} from '../mappers';
import { FirebaseService } from '../../firebase/services';
import { DiagnosticError, RequestContextService } from '../../observalibility';

@Injectable()
export class AuditWriter {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly requestContextService: RequestContextService,
  ) {}

  prepareProfileUpdated(
    targetUid: string,
    fields: readonly ProfileField[],
  ): AuditEvent {
    const context = this.requestContextService.require();

    if (!context.actorUid || context.actorUid !== targetUid) {
      throw new DiagnosticError('AUDIT_ACTOR_MISMATCH');
    }

    return toProfileUpdatedAuditEvent({
      actorUid: context.actorUid,
      targetUid,
      requestId: context.requestId,
      fields,
    });
  }

  prepareOrganizationCreated(
    organizationId: string,
    ownerUid: string,
    occurredAt: Date,
  ): AuditEvent {
    const context = this.requestContextService.require();

    if (!context.actorUid || context.actorUid !== ownerUid) {
      throw new DiagnosticError('AUDIT_ACTOR_MISMATCH');
    }

    return toOrganizationCreatedAuditEvent({
      actorUid: context.actorUid,
      organizationId,
      requestId: context.requestId,
      occurredAt,
    });
  }

  append(transaction: Transaction, event: AuditEvent): void {
    const reference = this.firebaseService.firestore
      .collection('auditEvents')
      .withConverter(auditEventConverter)
      .doc(event.eventId);

    transaction.create(reference, event);
  }
}
