import { Injectable } from '@nestjs/common';
import { FieldPath, Transaction } from 'firebase-admin/firestore';

import { OrganizationCursor } from '../utils/organizationCursor.util';
import { FirebaseService } from '../../firebase/services/firebase.service';
import { organizationConverter } from '../converters/organization.converter';
import {
  OrganizationMembership,
  organizationMembershipConverter,
} from '../converters/organizationMembership.converter';

@Injectable()
export class OrganizationMembershipRepository {
  constructor(private readonly firebase: FirebaseService) {}

  private collection(orgId: string) {
    return this.firebase.firestore
      .collection('orgs')
      .withConverter(organizationConverter)
      .doc(orgId)
      .collection('members')
      .withConverter(organizationMembershipConverter);
  }

  memberRef(orgId: string, userId: string) {
    return this.collection(orgId).doc(userId);
  }

  async findMember(transaction: Transaction, orgId: string, userId: string) {
    return (await transaction.get(this.memberRef(orgId, userId))).data();
  }

  async listActiveMemberships(
    transaction: Transaction,
    userId: string,
    limit: number,
    cursor?: OrganizationCursor,
  ): Promise<OrganizationMembership[]> {
    let query = this.firebase.firestore
      .collectionGroup('members')
      .withConverter(organizationMembershipConverter)
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .orderBy('createdAt')
      .orderBy(FieldPath.documentId());

    if (cursor) {
      query = query.startAfter(
        cursor.createdAt,
        this.memberRef(cursor.orgId, userId).path,
      );
    }

    const snapshot = await transaction.get(query.limit(limit));
    return snapshot.docs.map((doc) => doc.data());
  }
}
