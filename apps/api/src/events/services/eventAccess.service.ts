import { Transaction } from 'firebase-admin/firestore';
import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { EVENT_ROLES } from '../enums';
import { eventObjectSchema } from '../models';
import { eventConverter } from '../converters';
import { ApiException } from '../../common/exceptions';
import { FirebaseService } from '../../firebase/services';
import { EventMembershipRepository } from '../repositories/eventMembership.repository';
import { DiagnosticError } from '../../observalibility/errors';
import { ORGANIZATION_ROLES } from '../../organizations/enums';
import { organizationSchema } from '../../organizations/models';
import { EventAuthority, EventPermission, EventScope } from '../types';
import { EVENT_ROLE_PERMISSIONS, EVENTS_COLLECTION } from '../constants';
import { assertActiveOrganizationMembership } from '../../organizations/utils';
import {
  OrganizationRepository,
  OrganizationMembershipRepository,
} from '../../organizations/repositories';

type EventIdentity = Pick<
  EventScope,
  'actorUid' | 'organizationId' | 'eventId'
>;

const eventNotFound = (): ApiException =>
  new ApiException(HttpStatus.NOT_FOUND, 'EVENT_NOT_FOUND', 'Event not found');

@Injectable()
export class EventAccessService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly organizationRepository: OrganizationRepository,
    private readonly eventMembershipRepository: EventMembershipRepository,
    private readonly organizationMembershipRepository: OrganizationMembershipRepository,
  ) {}

  getEventReference(organizationId: string, eventId: string) {
    return this.organizationRepository
      .getDocumentReference(organizationId)
      .collection(EVENTS_COLLECTION)
      .withConverter(eventConverter)
      .doc(eventId);
  }

  async resolve(
    actorUid: string,
    rawOrganizationId: unknown,
    rawEventId: unknown,
  ): Promise<EventScope> {
    const organizationId =
      organizationSchema.shape.id.safeParse(rawOrganizationId);

    const eventId = eventObjectSchema.shape.id.safeParse(rawEventId);

    if (!organizationId.success || !eventId.success) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'EVENT_SCOPE_INVALID',
        'Valid organization and event IDs are required',
      );
    }

    return this.firebaseService.firestore.runTransaction((transaction) =>
      this.requireInTransaction(
        transaction,
        {
          actorUid,
          organizationId: organizationId.data,
          eventId: eventId.data,
        },
        ['event:read'],
      ),
    );
  }

  async requireInTransaction(
    transaction: Transaction,
    identity: EventIdentity,
    required: readonly EventPermission[],
  ): Promise<EventScope> {
    const loaded = await this.loadInTransaction(transaction, identity);

    const { organizationMembership, eventMembership } = loaded;

    if (organizationMembership) {
      assertActiveOrganizationMembership(organizationMembership);
    }

    let authority: EventAuthority;
    let permissions: readonly EventPermission[];

    if (
      organizationMembership?.role === ORGANIZATION_ROLES.OWNER ||
      organizationMembership?.role === ORGANIZATION_ROLES.ADMIN
    ) {
      authority = {
        kind: 'ORGANIZATION_ADMIN',
      };

      permissions = EVENT_ROLE_PERMISSIONS[EVENT_ROLES.MANAGER];
    } else if (eventMembership?.status === 'ACTIVE') {
      authority = {
        kind: 'EVENT_MEMBER',
        role: eventMembership.role,
      };

      permissions = EVENT_ROLE_PERMISSIONS[eventMembership.role];
    } else if (organizationMembership) {
      authority = {
        kind: 'ORGANIZATION_READER',
      };

      permissions = ['event:read'];
    } else {
      if (eventMembership?.status === 'SUSPENDED') {
        throw new ApiException(
          HttpStatus.FORBIDDEN,
          'EVENT_MEMBERSHIP_INACTIVE',
          'An active event membership is required.',
        );
      }

      throw eventNotFound();
    }

    const scope: EventScope = {
      ...identity,
      event: loaded.event,
      organizationMembership,
      eventMembership,
      authority,
      permissions,
    };

    this.assertPermissions(scope, required);

    return scope;
  }

  async loadInTransaction(transaction: Transaction, identity: EventIdentity) {
    const organizationSnapshot = await transaction.get(
      this.organizationRepository.getDocumentReference(identity.organizationId),
    );

    const eventSnapshot = await transaction.get(
      this.getEventReference(identity.organizationId, identity.eventId),
    );

    const organizationMembershipSnapshot = await transaction.get(
      this.organizationMembershipRepository.getDocumentReference(
        identity.organizationId,
        identity.actorUid,
      ),
    );

    const eventMembershipSnapshot = await transaction.get(
      this.eventMembershipRepository.getDocumentReference(
        identity.organizationId,
        identity.eventId,
        identity.actorUid,
      ),
    );

    const organization = organizationSnapshot.data();
    const event = eventSnapshot.data();

    const organizationMembership =
      organizationMembershipSnapshot.data() ?? null;

    const eventMembership = eventMembershipSnapshot.data() ?? null;

    if (!organization || !event) {
      throw eventNotFound();
    }

    if (
      organization.id !== identity.organizationId ||
      event.id !== identity.eventId ||
      event.organizationId !== identity.organizationId ||
      (organizationMembership !== null &&
        (organizationMembership.organizationId !== identity.organizationId ||
          organizationMembership.uid !== identity.actorUid)) ||
      (eventMembership !== null &&
        (eventMembership.organizationId !== identity.organizationId ||
          eventMembership.eventId !== identity.eventId ||
          eventMembership.uid != identity.actorUid))
    ) {
      throw new DiagnosticError('EVENT_STORAGE_INVARIANT_FAILED');
    }

    return {
      organization,
      event,
      organizationMembership,
      eventMembership,
    };
  }

  assertPermissions(
    scope: EventScope,
    required: readonly EventPermission[],
  ): void {
    if (required.length === 0) {
      throw new InternalServerErrorException(
        'An event operation must declare a permission.',
      );
    }

    if (
      !required.every((permission) => scope.permissions.includes(permission))
    ) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        'EVENT_PERMISSION_DENIED',
        'You do not have permission to perform this operation.',
      );
    }
  }
}
