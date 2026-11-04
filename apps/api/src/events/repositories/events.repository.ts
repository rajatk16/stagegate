import { FieldPath } from 'firebase-admin/firestore';
import { HttpStatus, Injectable } from '@nestjs/common';

import { EventScope } from '../types/eventScope.type';
import { EVENT_STATUS } from '../enums/eventStatus.enum';
import { eventConverter } from '../converters/event.converter';
import { EVENT_MEMBERSHIPS_COLLECTION, EVENTS_COLLECTION } from '../constants';
import { AuditWriter } from '../../audit/services/auditWriter.service';
import { ApiException } from '../../common/exceptions/api.exception';
import { FirebaseService } from '../../firebase/services/firebase.service';
import { OrganizationScope } from '../../organizations/types/organizationScope.type';
import { EventAccessService } from '../services/eventAccess.service';
import { EventSlugsRepository } from './eventSlugs.repository';
import { DiagnosticError } from '../../observalibility/errors/diagnostic.error';
import { getOrganizationMembershipKey } from '../../organizations/utils/organizationMembershipKey.util';
import {
  decodeEventCursor,
  encodeEventCursor,
  invalidEventCursor,
} from '../utils/eventCursor.util';
import { isOrganizationAdministrator } from '../utils/eventMembership.util';
import {
  Event,
  eventSchema,
  EventSettingsUpdate,
  eventSlugReservationSchema,
} from '../models/event.model';
import { OrganizationRepository } from '../../organizations/repositories/organizations.repository';
import { OrganizationMembershipRepository } from '../../organizations/repositories/organizationMembership.repository';
import { assertOrganizationPermissions } from '../../organizations/utils/organization.util';
import { eventMembershipConverter } from '../converters/eventMembership.converter';
import { assertEventStatusTransition } from '../../organizations/utils/eventLifecycle.util';
import { ServerClock } from '../../common/services/serverClock.service';

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
    private readonly serverClock: ServerClock,
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

        const now = this.serverClock.now();

        const created = eventSchema.parse({
          ...event,
          createdAt: now,
          updatedAt: now,
        });

        const reservation = eventSlugReservationSchema.parse({
          organizationId: created.organizationId,
          eventId: created.id,
          slug: created.slug,
          createdAt: now,
        });

        const auditEvent = this.auditWriter.prepareEventCreated(
          created.organizationId,
          created.id,
          scope.actorUid,
          now,
        );

        transaction.create(eventReference, created);
        transaction.create(slugReference, reservation);
        this.auditWriter.append(transaction, auditEvent);

        return created;
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

        const organizationAdmin = isOrganizationAdministrator(membership);

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
              'Check the timezone, event schedule, and submission window. Each date pair must be complete, with its end after its start.',
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
          candidate.timezone === current.timezone &&
          candidate.submissionOpensAt?.getTime() ===
            current.submissionOpensAt?.getTime() &&
          candidate.submissionClosesAt?.getTime() ===
            current.submissionClosesAt?.getTime() &&
          candidate.submissionInstructions === current.submissionInstructions &&
          candidate.maxSubmissionsPerPerson === current.maxSubmissionsPerPerson
        ) {
          return current;
        }

        const now = this.serverClock.now();

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
