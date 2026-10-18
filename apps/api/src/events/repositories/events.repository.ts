import { HttpStatus, Injectable } from '@nestjs/common';

import { eventConverter } from '../converters';
import { EVENTS_COLLECTION } from '../constants';
import { AuditWriter } from '../../audit/services';
import { ApiException } from '../../common/exceptions';
import { FirebaseService } from '../../firebase/services';
import { OrganizationScope } from '../../organizations/types';
import { EventSlugsRepository } from './eventSlugs.repository';
import { DiagnosticError } from '../../observalibility/errors';
import { assertOrganizationPermissions } from '../../organizations/utils';
import { Event, eventSchema, eventSlugReservationSchema } from '../models';
import {
  OrganizationRepository,
  OrganizationMembershipRepository,
} from '../../organizations/repositories';

@Injectable()
export class EventsRepository {
  constructor(
    private readonly auditWriter: AuditWriter,
    private readonly firebaseService: FirebaseService,
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
}
