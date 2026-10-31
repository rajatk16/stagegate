import { FieldPath } from 'firebase-admin/firestore';
import { HttpStatus, Injectable } from '@nestjs/common';

import { EventScope } from '../types';
import { EVENT_STATUS } from '../enums';
import { eventConverter, eventMembershipConverter } from '../converters';
import { EVENT_MEMBERSHIPS_COLLECTION, EVENTS_COLLECTION } from '../constants';
import { AuditWriter } from '../../audit/services';
import { ApiException } from '../../common/exceptions';
import { FirebaseService } from '../../firebase/services';
import { OrganizationScope } from '../../organizations/types';
import { EventAccessService } from '../services/eventAccess.service';
import { EventSlugsRepository } from './eventSlugs.repository';
import { DiagnosticError } from '../../observalibility/errors';
import {
  assertEventStatusTransition,
  assertOrganizationPermissions,
} from '../../organizations/utils';
import {
  OrganizationRepository,
  OrganizationMembershipRepository,
} from '../../organizations/repositories';
import {
  decodeEventCursor,
  encodeEventCursor,
  invalidEventCursor,
} from '../utils';
import {
  Event,
  eventSchema,
  EventSettingsUpdate,
  eventSlugReservationSchema,
} from '../models';
import { ORGANIZATION_ROLES } from '../../organizations/enums';
import { getOrganizationMembershipKey } from '../../organizations/utils/organizationMembershipKey.util';

type EventMutation =
  | {
      kind: 'settings';
      changes: EventSettingsUpdate;
    }
  | {
      kind: 'status';
      status: EVENT_STATUS;
    };

@Injectable()
export class EventsRepository {
  constructor(
    private readonly auditWriter: AuditWriter,
    private readonly firebaseService: FirebaseService,
    private readonly eventAccessService: EventAccessService,
    private readonly eventSlugsRepository: EventSlugsRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly organizationMembershipRepository: OrganizationMembershipRepository,
  ) {}

  private collection(organizationId: string) {
    return this.organizationRepository
      .getDocumentReference(organizationId)
      .collection(EVENTS_COLLECTION)
      .withConverter(eventConverter);
  }

  getDocumentReference(organizationId: string, eventId: string) {
    return this.collection(organizationId).doc(eventId);
  }

  async create(scope: OrganizationScope, value: Event): Promise<Event> {
    const event = eventSchema.parse(value);

    if (
      event.organizationId !== scope.organizationId ||
      event.createdByUid !== scope.actorUid
    ) {
      throw new DiagnosticError('EVENT_STORAGE_INVARIANT_FAILED');
    }

    const organizationReference =
      this.organizationRepository.getDocumentReference(scope.organizationId);

    const eventReference = this.getDocumentReference(
      scope.organizationId,
      event.id,
    );

    const slugReference = this.eventSlugsRepository.getDocumentReference(
      scope.organizationId,
      event.slug,
    );

    const reservation = eventSlugReservationSchema.parse({
      organizationId: event.organizationId,
      eventId: event.id,
      slug: event.slug,
      createdAt: event.createdAt,
    });

    const auditEvent = this.auditWriter.prepareEventCreated(
      event.organizationId,
      event.id,
      scope.actorUid,
      event.createdAt,
    );

    return this.firebaseService.firestore.runTransaction(
      async (transaction): Promise<Event> => {
        const organizationSnapshot = await transaction.get(
          organizationReference,
        );

        const organization = organizationSnapshot.data();

        if (!organization) {
          throw new ApiException(
            HttpStatus.NOT_FOUND,
            'ORGANIZATION_NOT_FOUND',
            'Organization not found',
          );
        }

        const membership =
          await this.organizationMembershipRepository.requireActiveInTransaction(
            transaction,
            scope.organizationId,
            scope.actorUid,
          );

        if (
          organization.id !== scope.organizationId ||
          membership.organizationId !== scope.organizationId ||
          membership.uid !== scope.actorUid
        ) {
          throw new DiagnosticError('EVENT_STORAGE_INVARIANT_FAILED');
        }

        assertOrganizationPermissions(membership, [
          'organization:events:create',
        ]);

        const slugSnapshot = await transaction.get(slugReference);

        if (slugSnapshot.exists) {
          throw new ApiException(
            HttpStatus.CONFLICT,
            'EVENT_SLUG_TAKEN',
            'This event slug is already in use in this organization.',
          );
        }

        transaction.create(eventReference, event);
        transaction.create(slugReference, reservation);
        this.auditWriter.append(transaction, auditEvent);

        return event;
      },
    );
  }

  async list(
    scope: OrganizationScope,
    limit: number,
    cursor?: string,
  ): Promise<{ items: Event[]; nextCursor: string | null }> {
    const afterEventId = decodeEventCursor(cursor, scope);

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const organizationSnapshot = await transaction.get(
          this.organizationRepository.getDocumentReference(
            scope.organizationId,
          ),
        );

        const organization = organizationSnapshot.data();

        if (!organization) {
          throw new ApiException(
            HttpStatus.NOT_FOUND,
            'ORGANIZATION_NOT_FOUND',
            'Organization not found.',
          );
        }

        const membership =
          await this.organizationMembershipRepository.requireActiveInTransaction(
            transaction,
            scope.organizationId,
            scope.actorUid,
          );

        if (
          organization.id !== scope.organizationId ||
          membership.organizationId !== scope.organizationId ||
          membership.uid !== scope.actorUid
        ) {
          throw new DiagnosticError('EVENT_STORAGE_INVARIANT_FAILED');
        }

        assertOrganizationPermissions(membership, ['organization:events:read']);

        const organizationAdmin =
          membership.role === ORGANIZATION_ROLES.OWNER ||
          membership.role === ORGANIZATION_ROLES.ADMIN;

        if (!organizationAdmin) {
          const membershipKey = getOrganizationMembershipKey(membership);

          let assignments = this.firebaseService.firestore
            .collectionGroup(EVENT_MEMBERSHIPS_COLLECTION)
            .withConverter(eventMembershipConverter)
            .where('organizationId', '==', scope.organizationId)
            .where('uid', '==', scope.actorUid)
            .where('organizationMembershipKey', '==', membershipKey)
            .where('status', '==', 'ACTIVE')
            .orderBy('eventId', 'asc');

          if (afterEventId !== undefined) {
            const anchorReference = this.getDocumentReference(
              scope.organizationId,
              afterEventId,
            )
              .collection(EVENT_MEMBERSHIPS_COLLECTION)
              .withConverter(eventMembershipConverter)
              .doc(scope.actorUid);

            const anchorSnapshot = await transaction.get(anchorReference);

            const anchor = anchorSnapshot.data();

            if (
              !anchor ||
              anchor.status !== 'ACTIVE' ||
              anchor.organizationMembershipKey !== membershipKey
            ) {
              throw invalidEventCursor();
            }

            assignments = assignments.startAfter(afterEventId);
          }

          const assignmentSnapshot = await transaction.get(
            assignments.limit(limit + 1),
          );

          const documents = assignmentSnapshot.docs.slice(0, limit);

          const eventSnapshots = await Promise.all(
            documents.map((document) =>
              transaction.get(
                this.getDocumentReference(
                  scope.organizationId,
                  document.data().eventId,
                ),
              ),
            ),
          );

          const items = eventSnapshots.flatMap((snapshot) => {
            const event = snapshot.data();
            return event ? [event] : [];
          });

          const last = documents.at(-1);

          return {
            items,
            nextCursor:
              assignmentSnapshot.docs.length > limit && last
                ? encodeEventCursor(scope, last.data().eventId)
                : null,
          };
        }

        let query = this.collection(scope.organizationId)
          .orderBy('createdAt', 'desc')
          .orderBy(FieldPath.documentId(), 'desc');

        if (afterEventId !== undefined) {
          const anchor = await transaction.get(
            this.getDocumentReference(scope.organizationId, afterEventId),
          );

          const event = anchor.data();

          if (!event || event.organizationId !== scope.organizationId) {
            throw invalidEventCursor();
          }

          query = query.startAfter(anchor);
        }

        const snapshot = await transaction.get(query.limit(limit + 1));
        const documents = snapshot.docs.slice(0, limit);
        const last = documents.at(-1);

        return {
          items: documents.map((document) => document.data()),
          nextCursor:
            snapshot.docs.length > limit && last
              ? encodeEventCursor(scope, last.id)
              : null,
        };
      },
    );
  }

  async get(scope: EventScope, eventId: string): Promise<Event> {
    if (scope.eventId !== eventId) {
      throw new DiagnosticError('EVENT_STORAGE_INVARIANT_FAILED');
    }

    return this.firebaseService.firestore.runTransaction(
      async (transaction): Promise<Event> => {
        const current = await this.eventAccessService.requireInTransaction(
          transaction,
          scope,
          ['event:read'],
        );

        return current.event;
      },
    );
  }

  updateSettings(
    scope: EventScope,
    eventId: string,
    changes: EventSettingsUpdate,
  ): Promise<Event> {
    return this.mutate(scope, eventId, {
      kind: 'settings',
      changes,
    });
  }

  updateStatus(
    scope: EventScope,
    eventId: string,
    status: EVENT_STATUS,
  ): Promise<Event> {
    return this.mutate(scope, eventId, {
      kind: 'status',
      status,
    });
  }

  private async mutate(
    scope: EventScope,
    eventId: string,
    mutation: EventMutation,
  ): Promise<Event> {
    if (scope.eventId !== eventId) {
      throw new DiagnosticError('EVENT_STORAGE_INVARIANT_FAILED');
    }
    const eventReference = this.getDocumentReference(
      scope.organizationId,
      eventId,
    );

    return this.firebaseService.firestore.runTransaction(
      async (transaction): Promise<Event> => {
        const currentScope = await this.eventAccessService.requireInTransaction(
          transaction,
          scope,
          [
            mutation.kind === 'settings'
              ? 'event:update'
              : 'event:manage-status',
          ],
        );

        const current = currentScope.event;

        if (!current) {
          throw new ApiException(
            HttpStatus.NOT_FOUND,
            'EVENT_NOT_FOUND',
            'Event not found.',
          );
        }

        if (
          current.id !== eventId ||
          current.organizationId !== scope.organizationId
        ) {
          throw new DiagnosticError('EVENT_STORAGE_INVARIANT_FAILED');
        }

        if (mutation.kind === 'settings') {
          if (current.status === EVENT_STATUS.ARCHIVED) {
            throw new ApiException(
              HttpStatus.CONFLICT,
              'EVENT_ARCHIVED',
              'Archived events cannot be edited.',
            );
          }
        } else {
          assertEventStatusTransition(current.status, mutation.status);

          if (current.status === mutation.status) {
            return current;
          }
        }

        const parsed = eventSchema.safeParse({
          ...current,
          ...(mutation.kind === 'settings'
            ? mutation.changes
            : { status: mutation.status }),
        });

        if (!parsed.success) {
          if (mutation.kind === 'settings') {
            throw new ApiException(
              HttpStatus.BAD_REQUEST,
              'EVENT_SETTINGS_INVALID',
              'Check the event settings.Provide a valid timezone and either both dates or neighter, with the end after the start.',
            );
          }

          throw new DiagnosticError('EVENT_STORAGE_INVARIANT_FAILED');
        }

        const candidate = parsed.data;

        if (
          mutation.kind === 'settings' &&
          candidate.name === current.name &&
          candidate.description === current.description &&
          candidate.format === current.format &&
          candidate.location === current.location &&
          candidate.startsAt?.getTime() === current.startsAt?.getTime() &&
          candidate.endsAt?.getTime() === current.endsAt?.getTime() &&
          candidate.timezone === current.timezone
        ) {
          return current;
        }

        const now = new Date();

        const next = eventSchema.parse({
          ...candidate,
          updatedAt: now,
        });

        const auditInput = {
          actorUid: scope.actorUid,
          organizationId: scope.organizationId,
          targetId: current.id,
          occurredAt: now,
        };

        const auditEvent =
          mutation.kind === 'settings'
            ? this.auditWriter.prepareEventUpdated(auditInput)
            : this.auditWriter.prepareEventStatusChanged({
                ...auditInput,
                previousStatus: current.status,
                nextStatus: mutation.status,
              });

        transaction.set(eventReference, next);
        this.auditWriter.append(transaction, auditEvent);

        return next;
      },
    );
  }
}
