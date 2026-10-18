import { HttpStatus, Injectable } from '@nestjs/common';
import { FieldPath, Filter } from 'firebase-admin/firestore';

import { auditEventConverter } from '../converters';
import { ApiException } from '../../common/exceptions';
import { FirebaseService } from '../../firebase/services';
import { toOrganizationAuditEventResponseDto } from '../mappers';
import type { OrganizationScope } from '../../organizations/types';
import { assertOrganizationPermissions } from '../../organizations/utils';
import {
  ListOrganizationAuditQueryDto,
  OrganizationAuditPageResponseDto,
} from '../dtos';
import {
  ORGANIZATIONS_COLLECTION,
  ORGANIZATION_MEMBERSHIPS_COLLECTION,
} from '../../organizations/constants';
import {
  organizationConverter,
  organizationMembershipConverter,
} from '../../organizations/converters';
import {
  invalidAuditCursor,
  getAuditOrganizationId,
  decodeOrganizationAuditCursor,
  encodeOrganizationAuditCursor,
} from '../utils';

@Injectable()
export class OrganizationAuditReader {
  constructor(private readonly firebaseService: FirebaseService) {}

  private collection() {
    return this.firebaseService.firestore
      .collection('auditEvents')
      .withConverter(auditEventConverter);
  }

  async list(
    scope: OrganizationScope,
    input: ListOrganizationAuditQueryDto,
  ): Promise<OrganizationAuditPageResponseDto> {
    const afterEventId = decodeOrganizationAuditCursor(input.cursor, scope);

    const organizationReference = this.firebaseService.firestore
      .collection(ORGANIZATIONS_COLLECTION)
      .withConverter(organizationConverter)
      .doc(scope.organizationId);

    const membershipReference = this.firebaseService.firestore
      .collection(ORGANIZATIONS_COLLECTION)
      .doc(scope.organizationId)
      .collection(ORGANIZATION_MEMBERSHIPS_COLLECTION)
      .withConverter(organizationMembershipConverter)
      .doc(scope.actorUid);

    return this.firebaseService.firestore.runTransaction(
      async (transaction): Promise<OrganizationAuditPageResponseDto> => {
        const organizationSnapshot = await transaction.get(
          organizationReference,
        );

        const membershipSnapshot = await transaction.get(membershipReference);

        const organization = organizationSnapshot.data();
        const membership = membershipSnapshot.data();

        if (!organization || !membership) {
          throw new ApiException(
            HttpStatus.NOT_FOUND,
            'ORGANIZATION_NOT_FOUND',
            'Organization not found.',
          );
        }

        // Reauthorize every page using current membership data.
        assertOrganizationPermissions(membership, ['organization:audit:read']);

        let query = this.collection()
          .where(
            Filter.or(
              Filter.where('organizationId', '==', scope.organizationId),
              Filter.and(
                Filter.where('targetType', '==', 'organization'),
                Filter.where('targetId', '==', scope.organizationId),
              ),
            ),
          )
          .orderBy('occurredAt', 'desc')
          .orderBy(FieldPath.documentId(), 'desc');

        if (afterEventId !== undefined) {
          const anchorSnapshot = await transaction.get(
            this.collection().doc(afterEventId),
          );

          const anchor = anchorSnapshot.data();

          if (
            !anchor ||
            getAuditOrganizationId(anchor) !== scope.organizationId
          ) {
            throw invalidAuditCursor();
          }

          query = query.startAfter(anchorSnapshot);
        }

        const snapshot = await transaction.get(query.limit(input.limit + 1));

        const documents = snapshot.docs.slice(0, input.limit);
        const lastDocument = documents.at(-1);

        return {
          items: documents.map((document) =>
            toOrganizationAuditEventResponseDto(
              document.data(),
              scope.organizationId,
            ),
          ),
          nextCursor:
            snapshot.docs.length > input.limit && lastDocument
              ? encodeOrganizationAuditCursor(scope, lastDocument.id)
              : null,
        };
      },
    );
  }
}
