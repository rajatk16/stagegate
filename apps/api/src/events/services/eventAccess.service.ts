import { Transaction } from 'firebase-admin/firestore';
import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import {
  EVENT_ROLE_PERMISSIONS,
  EVENTS_COLLECTION,
  ORGANIZATION_ADMIN_EVENT_PERMISSIONS,
} from '../constants';
import { getOrganizationMembershipKey } from '../../organizations/utils/organizationMembershipKey.util';
import { parseEventIdentity } from '../utils/event.util';
import { EventIdentity } from '../models/eventIdentity.model';
import { isOrganizationAdministrator } from '../utils/eventMembership.util';
import { ApiException } from '../../common/exceptions/api.exception';
import { FirebaseService } from '../../firebase/services/firebase.service';
import { OrganizationRepository } from '../../organizations/repositories/organizations.repository';
import { EventMembershipRepository } from '../repositories/eventMembership.repository';
import { OrganizationMembershipRepository } from '../../organizations/repositories/organizationMembership.repository';
import { eventConverter } from '../converters/event.converter';
import { EventPermission } from '../types/eventPermission.type';
import { EventScope } from '../types/eventScope.type';
import { assertActiveOrganizationMembership } from '../../organizations/utils/organization.util';
import { EventAuthority } from '../types/eventAuthority.type';
import { EVENT_ROLES } from '../enums/eventRoles.enum';
import { DiagnosticError } from '../../observalibility/errors/diagnostic.error';

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
    required: readonly EventPermission[] = ['event:read'],
  ): Promise<EventScope> {
    const identity = parseEventIdentity({
      actorUid,
      organizationId: rawOrganizationId,
      eventId: rawEventId,
    });

    return this.firebaseService.firestore.runTransaction((transaction) =>
      this.requireInTransaction(transaction, identity, required),
    );
  }

  async requireInTransaction(
    transaction: Transaction,
    rawIdentity: EventIdentity,
    required: readonly EventPermission[],
  ): Promise<EventScope> {
    const identity = parseEventIdentity(rawIdentity);

    if (required.length === 0) {
      throw new InternalServerErrorException(
        'An event operation must declare a permission.',
      );
    }

    const loaded = await this.loadInTransaction(transaction, identity);

    const organizationMembership = loaded.organizationMembership;

    if (!organizationMembership) {
      throw eventNotFound();
    }

    assertActiveOrganizationMembership(organizationMembership);

    const membershipKey = getOrganizationMembershipKey(organizationMembership);

    const eventMembership =
      loaded.eventMembership?.organizationMembershipKey === membershipKey
        ? loaded.eventMembership
        : null;

    const organizationAdmin = isOrganizationAdministrator(
      organizationMembership,
    );

    let authority: EventAuthority;
    let permissions: readonly EventPermission[];

    if (organizationAdmin) {
      authority = {
        kind: 'ORGANIZATION_ADMIN',
      };

      permissions = ORGANIZATION_ADMIN_EVENT_PERMISSIONS;
    } else {
      if (!eventMembership) {
        throw eventNotFound();
      }

      if (eventMembership.status !== 'ACTIVE') {
        throw new ApiException(
          HttpStatus.FORBIDDEN,
          'EVENT_MEMBERSHIP_INACTIVE',
          'An active event membership is required.',
        );
      }

      authority = {
        kind: 'EVENT_MEMBER',
        role: eventMembership.role as EVENT_ROLES,
      };

      permissions = EVENT_ROLE_PERMISSIONS[eventMembership.role as EVENT_ROLES];
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

  private async loadInTransaction(
    transaction: Transaction,
    identity: EventIdentity,
  ) {
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
          eventMembership.uid !== identity.actorUid))
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
