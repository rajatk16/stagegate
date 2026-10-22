import { Injectable } from '@nestjs/common';
import { Transaction } from 'firebase-admin/firestore';

import { AuditEvent } from '../models';
import { EVENT_STATUS } from '../../events/enums';
import { EventMutationAuditInput } from '../types';
import { auditEventConverter } from '../converters';
import { FirebaseService } from '../../firebase/services';
import { ORGANIZATION_ROLES } from '../../organizations/enums';
import { DiagnosticError } from '../../observalibility/errors';
import { RequestContextService } from '../../observalibility/services';
import { ORGANIZATION_SETTINGS_FIELDS, PROFILE_FIELDS } from '../enums';
import {
  OwnershipTransferredAuditInput,
  OrganizationInvitationAuditInput,
} from '../types';
import {
  toEventUpdatedAuditEvent,
  toEventCreatedAuditEvent,
  toProfileUpdatedAuditEvent,
  toEventStatusChangedAuditEvent,
  toOrganizationCreatedAuditEvent,
  OrganizationMemberStatusAuditInput,
  toOrganizationInvitationAuditEvent,
  toOrganizationSettingsUpdatedAuditEvent,
  toOrganizationMemberRoleChangedAuditEvent,
  toOrganizationMemberStatusChangedAuditEvent,
  toOrganizationOwnershipTransferredAuditEvent,
} from '../mappers';

@Injectable()
export class AuditWriter {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly requestContextService: RequestContextService,
  ) {}

  prepareProfileUpdated(
    targetUid: string,
    fields: readonly PROFILE_FIELDS[],
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

  prepareOrganizationSettingsUpdated(
    organizationId: string,
    actorUid: string,
    fields: readonly ORGANIZATION_SETTINGS_FIELDS[],
    occurredAt: Date,
  ): AuditEvent {
    const context = this.requestContextService.require();

    if (!context.actorUid || context.actorUid !== actorUid) {
      throw new DiagnosticError('AUDIT_ACTOR_MISMATCH');
    }

    return toOrganizationSettingsUpdatedAuditEvent({
      organizationId,
      actorUid,
      fields,
      occurredAt,
      requestId: context.requestId,
    });
  }

  prepareOrganizationMemberRoleChanged(
    organizationId: string,
    actorUid: string,
    targetUid: string,
    previousRole: ORGANIZATION_ROLES,
    nextRole: ORGANIZATION_ROLES,
    occurredAt: Date,
  ): AuditEvent {
    const context = this.requestContextService.require();

    if (!context.actorUid || context.actorUid !== actorUid) {
      throw new DiagnosticError('AUDIT_ACTOR_MISMATCH');
    }

    return toOrganizationMemberRoleChangedAuditEvent({
      organizationId,
      actorUid,
      targetUid,
      previousRole,
      nextRole,
      occurredAt,
      requestId: context.requestId,
    });
  }

  prepareOrganizationInvitation(
    input: OrganizationInvitationAuditInput,
  ): AuditEvent {
    const context = this.requestContextService.require();

    if (!context.actorUid || context.actorUid !== input.actorUid) {
      throw new DiagnosticError('AUDIT_ACTOR_MISMATCH');
    }

    return toOrganizationInvitationAuditEvent({
      ...input,
      requestId: context.requestId,
    });
  }

  prepareOrganizationMemberStatusChanged(
    input: OrganizationMemberStatusAuditInput,
  ): AuditEvent {
    const context = this.requestContextService.require();

    if (!context.actorUid || context.actorUid !== input.actorUid) {
      throw new DiagnosticError('AUDIT_ACTOR_MISMATCH');
    }

    return toOrganizationMemberStatusChangedAuditEvent({
      ...input,
      requestId: context.requestId,
    });
  }

  prepareOrganizationOwnershipTransferred(
    input: OwnershipTransferredAuditInput,
  ): AuditEvent {
    const context = this.requestContextService.require();

    if (!context.actorUid || context.actorUid !== input.actorUid)
      throw new DiagnosticError('AUDIT_ACTOR_MISMATCH');

    return toOrganizationOwnershipTransferredAuditEvent({
      ...input,
      requestId: context.requestId,
    });
  }

  prepareEventCreated(
    organizationId: string,
    targetId: string,
    actorUid: string,
    occurredAt: Date,
  ): AuditEvent {
    const context = this.requestContextService.require();

    if (!context.actorUid || context.actorUid !== actorUid) {
      throw new DiagnosticError('AUDIT_ACTOR_MISMATCH');
    }

    return toEventCreatedAuditEvent({
      organizationId,
      targetId,
      actorUid,
      occurredAt,
      requestId: context.requestId,
    });
  }

  prepareEventUpdated(
    input: Omit<EventMutationAuditInput, 'requestId'>,
  ): AuditEvent {
    const context = this.requestContextService.require();

    if (!context.actorUid || context.actorUid !== input.actorUid) {
      throw new DiagnosticError('AUDIT_ACTOR_MISMATCH');
    }

    return toEventUpdatedAuditEvent({
      ...input,
      requestId: context.requestId,
    });
  }

  prepareEventStatusChanged(
    input: Omit<EventMutationAuditInput, 'requestId'> & {
      previousStatus: EVENT_STATUS;
      nextStatus: EVENT_STATUS;
    },
  ): AuditEvent {
    const context = this.requestContextService.require();

    if (!context.actorUid || context.actorUid !== input.actorUid) {
      throw new DiagnosticError('AUDIT_ACTOR_MISMATCH');
    }

    return toEventStatusChangedAuditEvent({
      ...input,
      requestId: context.requestId,
    });
  }
}
