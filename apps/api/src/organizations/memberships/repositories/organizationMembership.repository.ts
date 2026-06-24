import { Injectable } from '@nestjs/common';

import { FirebaseService } from '@/firebase/firebase.service';

import { organizationMembershipConverter } from './organizationMembership.converter';
import { ORGANIZATION_MEMBERSHIPS_COLLECTION } from '../organizationMemberships.constant';
import { OrganizationMembership } from '../entities';

@Injectable()
export class OrganizationMembershipRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

  private collection() {
    return this.firebaseService.firestore
      .collection(ORGANIZATION_MEMBERSHIPS_COLLECTION)
      .withConverter(organizationMembershipConverter);
  }

  getDocumentReference(id: string) {
    return this.collection().doc(id);
  }

  async create(
    membership: OrganizationMembership,
  ): Promise<OrganizationMembership> {
    await this.collection().doc(membership.id).set(membership);

    return membership;
  }

  async findByUserAndOrganization(
    userId: string,
    organizationId: string,
  ): Promise<OrganizationMembership | null> {
    const snapshot = await this.collection()
      .where('userId', '==', userId)
      .where('organizationId', '==', organizationId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].data();
  }
}
