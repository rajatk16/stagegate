import z from 'zod';
import { HttpStatus, Injectable } from '@nestjs/common';
import { FieldPath, Timestamp } from 'firebase-admin/firestore';

import { AuditWriter } from '../../audit';
import { ApiException } from '../../common';
import { ORGANIZATION_ROLES } from '../enums';
import { DiagnosticError } from '../../observalibility';
import { FirebaseService } from '../../firebase/services';
import {
  assertOrganizationRoleChange,
  assertOrganizationPermissions,
} from '../utils';
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
  OrganizationMembershipPage,
  OrganizationMembershipDocument,
} from '../types';

@Injectable()
export class OrganizationmembershipRepository {
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
}
