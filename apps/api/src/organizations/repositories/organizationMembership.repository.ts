import { Injectable } from '@nestjs/common';

import { OrganizationMembershipPage } from '../types';
import { FirebaseService } from '../../firebase/services';
import {
  ORGANIZATIONS_COLLECTION,
  ORGANIZATION_MEMBERSHIPS_COLLECTION,
} from '../constants';
import {
  organizationConverter,
  organizationMembershipConverter,
} from '../converters';

@Injectable()
export class OrganizationmembershipRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

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
}
