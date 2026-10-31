import { HttpStatus, Injectable } from '@nestjs/common';
import { FieldPath } from 'firebase-admin/firestore';

import { EVENT_STATUS, EVENT_ROLES } from '../enums';
import type { EventScope } from '../types';
import { eventMembershipSchema } from '../models';
import { AuditWriter } from '../../audit/services';
import { toEventMembershipResponse } from '../mappers';
import { FirebaseService } from '../../firebase/services';
import { EventAccessService } from './eventAccess.service';
import { EventMembershipRepository } from '../repositories/eventMembership.repository';
import { ORGANIZATION_ROLES } from '../../organizations/enums';
import { OrganizationMembershipRepository } from '../../organizations/repositories';
import {
  ApiException,
  RequestValidationException,
} from '../../common/exceptions';
import { AddEventMemberDto } from '../dtos';
import { getOrganizationMembershipKey } from '../../organizations/utils/organizationMembershipKey.util';

type MemberMutation =
  | {
      kind: 'role';
      role: EVENT_ROLES;
    }
  | {
      kind: 'status';
      status: 'ACTIVE' | 'SUSPENDED';
    };

@Injectable()
export class EventMembersService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly access: EventAccessService,
    private readonly memberships: EventMembershipRepository,
    private readonly organizationMemberships: OrganizationMembershipRepository,
    private readonly audit: AuditWriter,
  ) {}

  private validateUid(value: unknown): string {
    const parsed = eventMembershipSchema.shape.uid.safeParse(value);

    if (!parsed.success) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'EVENT_MEMBER_UID_INVALID',
        'A valid member UID is required.',
      );
    }

    return parsed.data;
  }

  async current(scope: EventScope) {
    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const current = await this.access.requireInTransaction(
          transaction,
          scope,
          ['event:read'],
        );

        return {
          organizationId: current.organizationId,
          eventId: current.eventId,
          authority: current.authority,
          permissions: [...current.permissions],
          membership: current.eventMembership
            ? toEventMembershipResponse(current.eventMembership)
            : null,
        };
      },
    );
  }

  async list(scope: EventScope, limit: number, cursor?: string) {
    const afterUid =
      cursor === undefined ? undefined : this.validateUid(cursor);

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        await this.access.requireInTransaction(transaction, scope, [
          'event:members:read',
        ]);

        let query = this.memberships
          .getCollection(scope.organizationId, scope.eventId)
          .orderBy(FieldPath.documentId(), 'asc');

        if (afterUid !== undefined) {
          const anchor = await transaction.get(
            this.memberships.getDocumentReference(
              scope.organizationId,
              scope.eventId,
              afterUid,
            ),
          );

          if (!anchor.exists) {
            throw new RequestValidationException([
              {
                field: 'cursor',
                code: 'INVALID_VALUE',
              },
            ]);
          }

          query = query.startAfter(anchor);
        }

        const snapshot = await transaction.get(query.limit(limit + 1));

        const documents = snapshot.docs.slice(0, limit);

        const parents = await Promise.all(
          documents.map((document) =>
            transaction.get(
              this.organizationMemberships.getDocumentReference(
                scope.organizationId,
                document.id,
              ),
            ),
          ),
        );

        const items = documents.flatMap((document, index) => {
          const assignment = document.data();
          const parent = parents[index].data();

          if (
            !parent ||
            assignment.organizationMembershipKey !==
              getOrganizationMembershipKey(parent)
          ) {
            return [];
          }

          return [
            {
              ...toEventMembershipResponse(assignment),
              organizationStatus: parent.status,
              effectiveStatus:
                parent.status === 'ACTIVE' ? assignment.status : 'SUSPENDED',
            },
          ];
        });

        return {
          items,
          nextCursor:
            snapshot.docs.length > limit
              ? (documents.at(-1)?.id ?? null)
              : null,
        };
      },
    );
  }

  async mutate(
    scope: EventScope,
    rawTargetUid: unknown,
    mutation: MemberMutation,
  ) {
    const targetUid = this.validateUid(rawTargetUid);

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const actor = await this.access.requireInTransaction(
          transaction,
          scope,
          ['event:members:manage'],
        );

        this.assertOrganizationAdmin(actor);

        if (scope.actorUid === targetUid) {
          throw new ApiException(
            HttpStatus.FORBIDDEN,
            'EVENT_SELF_MEMBERSHIP_CHANGE_FORBIDDEN',
            'You cannot change your own membership.',
          );
        }

        const targetReference = this.memberships.getDocumentReference(
          scope.organizationId,
          scope.eventId,
          targetUid,
        );

        const targetSnapshot = await transaction.get(targetReference);

        const targetOrganizationSnapshot = await transaction.get(
          this.organizationMemberships.getDocumentReference(
            scope.organizationId,
            targetUid,
          ),
        );

        const target = targetSnapshot.data();
        const targetOrganization = targetOrganizationSnapshot.data();

        if (!target) {
          throw new ApiException(
            HttpStatus.NOT_FOUND,
            'EVENT_MEMBER_NOT_FOUND',
            'Event member not found.',
          );
        }

        if (
          !target ||
          !targetOrganization ||
          target.organizationMembershipKey !==
            getOrganizationMembershipKey(targetOrganization)
        ) {
          throw new ApiException(
            HttpStatus.NOT_FOUND,
            'EVENT_MEMBER_NOT_FOUND',
            'Event member not found.',
          );
        }

        if (
          targetOrganization.role === ORGANIZATION_ROLES.OWNER ||
          targetOrganization.role === ORGANIZATION_ROLES.ADMIN
        ) {
          throw new ApiException(
            HttpStatus.FORBIDDEN,
            'EVENT_ORGANIZATION_ADMIN_CHANGE_FORBIDDEN',
            'Change this person’s organization role or status instead.',
          );
        }

        if (
          targetOrganization.status !== 'ACTIVE' &&
          (mutation.kind === 'role' || mutation.status === 'ACTIVE')
        ) {
          throw new ApiException(
            HttpStatus.CONFLICT,
            'EVENT_TARGET_ORGANIZATION_MEMBERSHIP_INACTIVE',
            'Reactivate the organization membership first.',
          );
        }

        const archived = actor.event.status === EVENT_STATUS.ARCHIVED;

        if (
          archived &&
          (mutation.kind === 'role' || mutation.status === 'ACTIVE')
        ) {
          throw new ApiException(
            HttpStatus.CONFLICT,
            'EVENT_ARCHIVED',
            'Archived events only allow membership suspension.',
          );
        }

        if (mutation.kind === 'role' && target.status !== 'ACTIVE') {
          throw new ApiException(
            HttpStatus.CONFLICT,
            'EVENT_MEMBER_INACTIVE',
            'Reactivate the membership before changing its role.',
          );
        }

        const unchanged =
          mutation.kind === 'role'
            ? target.role === mutation.role
            : target.status === mutation.status;

        if (unchanged) {
          return toEventMembershipResponse(target);
        }

        const now = new Date();

        const updated = eventMembershipSchema.parse({
          ...target,
          ...(mutation.kind === 'role'
            ? { role: mutation.role }
            : { status: mutation.status }),
          updatedAt: now,
        });

        const auditBase = {
          actorUid: scope.actorUid,
          organizationId: scope.organizationId,
          targetEventId: scope.eventId,
          targetType: 'eventMembership' as const,
          targetUid,
          occurredAt: now,
        };

        const audit =
          mutation.kind === 'role'
            ? this.audit.prepareEventMembership({
                ...auditBase,
                action: 'event.member.role.changed',
                previousRole: target.role,
                nextRole: mutation.role,
              })
            : this.audit.prepareEventMembership({
                ...auditBase,
                action: 'event.member.status.changed',
                role: target.role,
                previousStatus: target.status,
                nextStatus: mutation.status,
              });

        transaction.set(targetReference, updated);
        this.audit.append(transaction, audit);

        return toEventMembershipResponse(updated);
      },
    );
  }

  async add(scope: EventScope, input: AddEventMemberDto) {
    const targetUid = this.validateUid(input.uid);

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const actor = await this.access.requireInTransaction(
          transaction,
          scope,
          ['event:members:manage'],
        );

        this.assertOrganizationAdmin(actor);

        if (actor.event.status === EVENT_STATUS.ARCHIVED) {
          throw new ApiException(
            HttpStatus.CONFLICT,
            'EVENT_ARCHIVED',
            'Archived events cannot receive new members.',
          );
        }

        const parentSnapshot = await transaction.get(
          this.organizationMemberships.getDocumentReference(
            scope.organizationId,
            targetUid,
          ),
        );

        const parent = parentSnapshot.data();

        if (!parent) {
          throw new ApiException(
            HttpStatus.CONFLICT,
            'EVENT_TARGET_ORGANIZATION_MEMBERSHIP_REQUIRED',
            'This person must join the organization first.',
          );
        }

        if (parent.status !== 'ACTIVE') {
          throw new ApiException(
            HttpStatus.CONFLICT,
            'EVENT_TARGET_ORGANIZATION_MEMBERSHIP_INACTIVE',
            'Reactivate this person’s organization membership first.',
          );
        }

        if (
          parent.role === ORGANIZATION_ROLES.OWNER ||
          parent.role === ORGANIZATION_ROLES.ADMIN
        ) {
          throw new ApiException(
            HttpStatus.CONFLICT,
            'EVENT_ORGANIZATION_ADMIN_ASSIGNMENT_UNNECESSARY',
            'Organization owners and administrators already have event access.',
          );
        }

        const reference = this.memberships.getDocumentReference(
          scope.organizationId,
          scope.eventId,
          targetUid,
        );

        const existingSnapshot = await transaction.get(reference);

        const existing = existingSnapshot.data();

        const membershipKey = getOrganizationMembershipKey(parent);

        if (existing?.organizationMembershipKey === membershipKey) {
          throw new ApiException(
            HttpStatus.CONFLICT,
            'EVENT_ALREADY_MEMBER',
            'This person already has an event assignment. Use the role or status controls.',
          );
        }

        const now = new Date();

        const membership = eventMembershipSchema.parse({
          organizationId: scope.organizationId,
          eventId: scope.eventId,
          uid: targetUid,
          organizationMembershipKey: membershipKey,
          role: input.role,
          status: 'ACTIVE',
          createdAt: now,
          updatedAt: now,
        });

        const audit = this.audit.prepareEventMembership({
          action: 'event.member.joined',
          targetType: 'eventMembership',
          actorUid: scope.actorUid,
          organizationId: scope.organizationId,
          targetEventId: scope.eventId,
          targetUid,
          role: membership.role,
          occurredAt: now,
        });

        // Replaces only an unbound or earlier-membership assignment.
        // A current assignment was rejected above.
        transaction.set(reference, membership);
        this.audit.append(transaction, audit);

        return toEventMembershipResponse(membership);
      },
    );
  }

  private assertOrganizationAdmin(scope: EventScope): void {
    if (scope.authority.kind !== 'ORGANIZATION_ADMIN') {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        'EVENT_MEMBERSHIP_ADMIN_REQUIRED',
        'Only organization owners and administrators can manage event memberships.',
      );
    }
  }
}
