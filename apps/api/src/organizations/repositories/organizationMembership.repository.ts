import z from 'zod';
import { HttpStatus, Injectable } from '@nestjs/common';
import { FieldPath, Timestamp, Transaction } from 'firebase-admin/firestore';

import { ORGANIZATION_ROLES } from '../enums';
import { AuditWriter } from '../../audit/services';
import { ApiException } from '../../common/exceptions';
import { FirebaseService } from '../../firebase/services';
import { assertRecentAuthentication } from '../../auth/utils';
import { DiagnosticError } from '../../observalibility/errors';
import {
  OrganizationMembership,
  organizationMembershipSchema,
} from '../models';
import {
  ORGANIZATIONS_COLLECTION,
  ORGANIZATION_MEMBERSHIPS_COLLECTION,
} from '../constants';
import {
  organizationConverter,
  organizationMembershipConverter,
} from '../converters';
import {
  OrganizationScope,
  OwnershipTransferResult,
  OrganizationMembershipPage,
  OrganizationMembershipDocument,
} from '../types';
import {
  assertOrganizationRoleChange,
  assertOrganizationPermissions,
  canManageOrganizationMemberStatus,
  assertActiveOrganizationMembership,
} from '../utils';

type MembershipLifecycleCommand =
  | {
      kind: 'leave';
    }
  | {
      kind: 'status';
      targetUid: string;
      status: 'ACTIVE' | 'SUSPENDED';
    };

@Injectable()
export class OrganizationMembershipRepository {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly audit: AuditWriter,
  ) {}

  private getCollection(organizationId: string) {
    return this.firebaseService.firestore
      .collection(ORGANIZATIONS_COLLECTION)
      .withConverter(organizationConverter)
      .doc(organizationId)
      .collection(ORGANIZATION_MEMBERSHIPS_COLLECTION)
      .withConverter(organizationMembershipConverter);
  }

  private getCollectionGroup() {
    return this.firebaseService.firestore
      .collectionGroup(ORGANIZATION_MEMBERSHIPS_COLLECTION)
      .withConverter(organizationMembershipConverter);
  }

  getDocumentReference(organizationId: string, membershipId: string) {
    return this.getCollection(organizationId).doc(membershipId);
  }

  async listByUser(
    uid: string,
    limit: number,
    afterOrganizationId?: string,
  ): Promise<OrganizationMembershipPage> {
    let query = this.getCollectionGroup()
      .where('uid', '==', uid)
      .orderBy('organizationId', 'asc');

    if (afterOrganizationId !== undefined) {
      query = query.startAfter(afterOrganizationId);
    }

    const snapshot = await query.limit(limit + 1).get();

    const memberships = snapshot.docs.map((document) => document.data());

    return {
      items: memberships.slice(0, limit),
      hasMore: memberships.length > limit,
    };
  }

  async findByOrganizationAndUser(
    organizationId: string,
    uid: string,
  ): Promise<OrganizationMembership | null> {
    const snapshot = await this.getDocumentReference(organizationId, uid).get();

    return snapshot.data() ?? null;
  }

  async listByOrganization(
    organizationId: string,
    limit: number,
    afterUid?: string,
  ): Promise<OrganizationMembershipPage> {
    let query = this.getCollection(organizationId).orderBy(
      FieldPath.documentId(),
      'asc',
    );

    if (afterUid !== undefined) {
      query = query.startAfter(afterUid);
    }

    const snapshot = await query.limit(limit + 1).get();

    return {
      items: snapshot.docs.slice(0, limit).map((document) => document.data()),
      hasMore: snapshot.docs.length > limit,
    };
  }

  async changeRole(
    scope: OrganizationScope,
    targetUid: string,
    requestedRole: ORGANIZATION_ROLES,
  ): Promise<OrganizationMembership> {
    const validatedUid =
      organizationMembershipSchema.shape.uid.parse(targetUid);

    const nextRole = z.nativeEnum(ORGANIZATION_ROLES).parse(requestedRole);

    const actorReference = this.getDocumentReference(
      scope.organizationId,
      scope.actorUid,
    );

    const targetReference = this.getDocumentReference(
      scope.organizationId,
      validatedUid,
    );

    const organizationReference = this.firebaseService.firestore
      .collection(ORGANIZATIONS_COLLECTION)
      .withConverter(organizationConverter)
      .doc(scope.organizationId);

    return this.firebaseService.firestore.runTransaction(
      async (transaction): Promise<OrganizationMembership> => {
        const actorSnapshot = await transaction.get(actorReference);
        const organizationSnapshot = await transaction.get(
          organizationReference,
        );

        const actor = actorSnapshot.data();
        const organization = organizationSnapshot.data();

        if (!actor || !organization) {
          throw new ApiException(
            HttpStatus.NOT_FOUND,
            'ORGANIZATION_NOT_FOUND',
            'Organization not found.',
          );
        }

        if (
          actor.uid !== scope.actorUid ||
          actor.organizationId !== scope.organizationId ||
          organization.id !== scope.organizationId
        ) {
          throw new DiagnosticError('ORGANIZATION_STORAGE_INVARIANT_FAILED');
        }

        assertOrganizationPermissions(actor, ['organization:members:manage']);

        const targetSnapshot = await transaction.get(targetReference);
        const target = targetSnapshot.data();

        if (!target) {
          throw new ApiException(
            HttpStatus.NOT_FOUND,
            'ORGANIZATION_MEMBER_NOT_FOUND',
            'Organization member not found.',
          );
        }

        if (
          target.uid !== validatedUid ||
          target.organizationId !== scope.organizationId
        ) {
          throw new DiagnosticError('ORGANIZATION_STORAGE_INVARIANT_FAILED');
        }

        assertOrganizationRoleChange(actor, target, nextRole);

        if (target.role === nextRole) {
          return target;
        }

        const updatedAt = new Date();

        const updated = organizationMembershipSchema.parse({
          ...target,
          role: nextRole,
          updatedAt,
        });

        const documentPatch: Pick<
          OrganizationMembershipDocument,
          'role' | 'updatedAt'
        > = {
          role: nextRole,
          updatedAt: Timestamp.fromDate(updatedAt),
        };

        const auditEvent = this.audit.prepareOrganizationMemberRoleChanged(
          scope.organizationId,
          actor.uid,
          target.uid,
          target.role,
          nextRole,
          updatedAt,
        );

        transaction.update(targetReference, documentPatch);
        this.audit.append(transaction, auditEvent);

        return updated;
      },
    );
  }

  async requireActiveInTransaction(
    transaction: Transaction,
    organizationId: string,
    uid: string,
  ): Promise<OrganizationMembership> {
    const snapshot = await transaction.get(
      this.getDocumentReference(organizationId, uid),
    );

    const membership = snapshot.data();

    if (!membership) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        'ORGANIZATION_MEMBERSHIP_REQUIRED',
        'An active organization membership is required.',
      );
    }

    assertActiveOrganizationMembership(membership);

    return membership;
  }

  async leave(scope: OrganizationScope): Promise<void> {
    await this.changeLifecycle(scope, {
      kind: 'leave',
    });
  }

  async changeStatus(
    scope: OrganizationScope,
    targetUid: string,
    status: 'ACTIVE' | 'SUSPENDED',
  ): Promise<OrganizationMembership> {
    const membership = await this.changeLifecycle(scope, {
      kind: 'status',
      targetUid,
      status,
    });

    if (!membership) {
      throw new DiagnosticError('ORGANIZATION_STORAGE_INVARIANT_FAILED');
    }

    return membership;
  }

  async transferOwnership(
    scope: OrganizationScope,
    targetUid: string,
    authTime: number,
  ): Promise<OwnershipTransferResult> {
    const organizationReference = this.firebaseService.firestore
      .collection(ORGANIZATIONS_COLLECTION)
      .withConverter(organizationConverter)
      .doc(scope.organizationId);

    const actorReference = this.getDocumentReference(
      scope.organizationId,
      scope.actorUid,
    );

    const targetReference = this.getDocumentReference(
      scope.organizationId,
      targetUid,
    );

    return this.firebaseService.firestore.runTransaction(
      async (transaction): Promise<OwnershipTransferResult> => {
        assertRecentAuthentication(authTime);

        const organizationSnapshot = await transaction.get(
          organizationReference,
        );

        const actorSnapshot = await transaction.get(actorReference);

        const targetSnapshot = await transaction.get(targetReference);

        const organization = organizationSnapshot.data();
        const actor = actorSnapshot.data();
        const target = targetSnapshot.data();

        if (!organization || !actor) {
          throw new ApiException(
            HttpStatus.NOT_FOUND,
            'ORGANIZATION_NOT_FOUND',
            'Organization not found.',
          );
        }

        assertOrganizationPermissions(actor, [
          'organization:ownership:transfer',
        ]);

        if (actor.role !== ORGANIZATION_ROLES.OWNER) {
          throw new ApiException(
            HttpStatus.FORBIDDEN,
            'ORGANIZATION_OWNER_REQUIRED',
            'An active owner must perform this operation.',
          );
        }

        if (!target) {
          throw new ApiException(
            HttpStatus.NOT_FOUND,
            'ORGANIZATION_MEMBER_NOT_FOUND',
            'Organization member not found',
          );
        }

        if (
          organization.id !== scope.organizationId ||
          actor.organizationId !== scope.organizationId ||
          actor.uid !== scope.actorUid ||
          target.organizationId !== scope.organizationId ||
          target.uid !== targetUid
        ) {
          throw new DiagnosticError('ORGANIZATION_STORAGE_INVARIANT_FAILED');
        }

        if (actor.uid === target.uid) {
          throw new ApiException(
            HttpStatus.BAD_REQUEST,
            'ORGANIZATION_SELF_TRANSFER_FORBIDDEN',
            'Choose another organization member.',
          );
        }

        assertActiveOrganizationMembership(target);

        if (target.role === ORGANIZATION_ROLES.OWNER) {
          throw new ApiException(
            HttpStatus.CONFLICT,
            'ORGANIZATION_TARGET_ALREADY_OWNER',
            'This member is already an owner.',
          );
        }

        assertRecentAuthentication(authTime);

        const now = new Date();

        const previousOwner = organizationMembershipSchema.parse({
          ...actor,
          role: ORGANIZATION_ROLES.ADMIN,
          updatedAt: now,
        });

        const newOwner = organizationMembershipSchema.parse({
          ...target,
          role: ORGANIZATION_ROLES.OWNER,
          updatedAt: now,
        });

        const event = this.audit.prepareOrganizationOwnershipTransferred({
          actorUid: actor.uid,
          organizationId: scope.organizationId,
          newOwnerUid: target.uid,
          newOwnerPreviousRole: target.role,
          occurredAt: now,
        });

        transaction.set(actorReference, previousOwner);
        transaction.set(targetReference, newOwner);

        transaction.update(organizationReference, {
          membershipRevision: organization.membershipRevision + 1,
        });

        this.audit.append(transaction, event);

        return {
          newOwner,
          previousOwner,
          organizationId: scope.organizationId,
        };
      },
    );
  }

  private async changeLifecycle(
    scope: OrganizationScope,
    command: MembershipLifecycleCommand,
  ): Promise<OrganizationMembership | null> {
    const targetUid =
      command.kind === 'leave'
        ? scope.actorUid
        : organizationMembershipSchema.shape.uid.parse(command.targetUid);

    const organizationReference = this.firebaseService.firestore
      .collection(ORGANIZATIONS_COLLECTION)
      .withConverter(organizationConverter)
      .doc(scope.organizationId);

    const actorReference = this.getDocumentReference(
      scope.organizationId,
      scope.actorUid,
    );

    const targetReference = this.getDocumentReference(
      scope.organizationId,
      targetUid,
    );

    return this.firebaseService.firestore.runTransaction(
      async (transaction): Promise<OrganizationMembership | null> => {
        const organizationSnapshot = await transaction.get(
          organizationReference,
        );

        const actorSnapshot = await transaction.get(actorReference);

        const targetSnapshot =
          command.kind === 'leave'
            ? actorSnapshot
            : await transaction.get(targetReference);

        const organization = organizationSnapshot.data();
        const actor = actorSnapshot.data();
        const target = targetSnapshot.data();

        if (!organization || !actor) {
          throw new ApiException(
            HttpStatus.NOT_FOUND,
            'ORGANIZATION_NOT_FOUND',
            'Organization not found.',
          );
        }

        if (!target) {
          throw new ApiException(
            HttpStatus.NOT_FOUND,
            'ORGANIZATION_MEMBER_NOT_FOUND',
            'Organization member not found.',
          );
        }

        if (
          organization.id !== scope.organizationId ||
          actor.organizationId !== scope.organizationId ||
          actor.uid !== scope.actorUid ||
          target.organizationId !== scope.organizationId ||
          target.uid !== targetUid
        ) {
          throw new DiagnosticError('ORGANIZATION_STORAGE_INVARIANT_FAILED');
        }

        assertActiveOrganizationMembership(actor);

        if (command.kind === 'status') {
          assertOrganizationPermissions(actor, ['organization:members:manage']);

          if (actor.uid === target.uid) {
            throw new ApiException(
              HttpStatus.FORBIDDEN,
              'ORGANIZATION_SELF_STATUS_CHANGE_FORBIDDEN',
              'Use the leave operation to leave this organization.',
            );
          }

          const canManageTarget = canManageOrganizationMemberStatus(
            actor,
            target,
          );

          if (!canManageTarget) {
            throw new ApiException(
              HttpStatus.FORBIDDEN,
              'ORGANIZATION_MEMBER_STATUS_CHANGE_FORBIDDEN',
              'You cannot change this member’s status.',
            );
          }

          if (target.status === command.status) {
            return target;
          }
        }

        const removesActiveOwner =
          target.role === ORGANIZATION_ROLES.OWNER &&
          target.status === 'ACTIVE' &&
          (command.kind === 'leave' || command.status === 'SUSPENDED');

        if (removesActiveOwner) {
          // Query by role so legacy documents without a stored
          // status still pass through the converter's ACTIVE default.
          const ownersSnapshot = await transaction.get(
            this.getCollection(scope.organizationId).where(
              'role',
              '==',
              ORGANIZATION_ROLES.OWNER,
            ),
          );

          const activeOwnerCount = ownersSnapshot.docs
            .map((document) => document.data())
            .filter((membership) => membership.status === 'ACTIVE').length;

          if (activeOwnerCount <= 1) {
            throw new ApiException(
              HttpStatus.CONFLICT,
              'ORGANIZATION_LAST_ACTIVE_OWNER',
              'The organization must retain an active owner.',
            );
          }
        }

        const now = new Date();

        const updated =
          command.kind === 'status'
            ? organizationMembershipSchema.parse({
                ...target,
                status: command.status,
                updatedAt: now,
              })
            : null;

        const event = this.audit.prepareOrganizationMemberStatusChanged({
          actorUid: actor.uid,
          organizationId: scope.organizationId,
          targetUid: target.uid,
          role: target.role,
          previousStatus: target.status,
          nextStatus: command.kind === 'leave' ? 'LEFT' : command.status,
          occurredAt: now,
        });

        // All reads are complete before staging writes.
        if (updated) {
          transaction.set(targetReference, updated);
        } else {
          transaction.delete(targetReference);
        }

        // Every lifecycle operation contends on the same organization
        // document, including changes affecting different members.
        transaction.update(organizationReference, {
          membershipRevision: organization.membershipRevision + 1,
        });

        this.audit.append(transaction, event);

        return updated;
      },
    );
  }
}
