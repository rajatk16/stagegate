import { Injectable } from "@nestjs/common";
import { Transaction } from "firebase-admin/firestore";

import { AuditEvent } from "../models";
import { ProfileField } from "../enums";
import { auditEventConverter } from "../converters";
import { toProfileUpdatedAuditEvent } from "../mappers";
import { FirebaseService } from "../../firebase/services";
import { RequestContextService } from "../../observalibility";

@Injectable()
export class AuditWriter {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly requestContextService: RequestContextService
  ) {}

  prepareProfileUpdated(
    targetUid: string,
    fields: readonly ProfileField[],
  ): AuditEvent {
    const context = this.requestContextService.require();

    if (!context.actorUid || context.actorUid !== targetUid) {
      throw new Error('Invalid actor for self-profile audit event');
    }

    return toProfileUpdatedAuditEvent({
      actorUid: context.actorUid,
      targetUid,
      requestId: context.requestId,
      fields
    });
  }

  append(
    transaction: Transaction,
    event: AuditEvent
  ): void {
    const reference = this.firebaseService.firestore.collection('auditEvents').withConverter(auditEventConverter).doc(event.eventId);

    transaction.create(reference, event);
  }
}
