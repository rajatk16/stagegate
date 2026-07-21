import { Injectable } from '@nestjs/common';

import { FirebaseService } from '@/firebase/firebase.service';

import { OrganizationMembershipInvitation } from '../entities';
import { OrganizationMembershipInvitationStatus } from '../enums';
import { organizationMembershipInvitationConverter } from '../converters';
import { ORGANIZATION_MEMBERSHIP_INVITATIONS_COLLECTION } from '../constants';

@Injectable()
export class OrganizationMembershipInvitationRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

  private collection() {
    return this.firebaseService.firestore
      .collection(ORGANIZATION_MEMBERSHIP_INVITATIONS_COLLECTION)
      .withConverter(organizationMembershipInvitationConverter);
  }

  getDocumentReference(id: string) {
    return this.collection().doc(id);
  }

  async save(invitation: OrganizationMembershipInvitation): Promise<void> {
    await this.collection().doc(invitation.id).set(invitation);
  }

  async findById(id: string): Promise<OrganizationMembershipInvitation | null> {
    const snapshot = await this.collection().doc(id).get();

    if (!snapshot.exists) {
      return null;
    }

    return snapshot.data()!;
  }

  async findPendingByEmail(
    email: string,
    organizationId: string,
  ): Promise<OrganizationMembershipInvitation | null> {
    const snapshot = await this.collection()
      .where('email', '==', email.toLowerCase())
      .where('organizationId', '==', organizationId)
      .where('status', '==', OrganizationMembershipInvitationStatus.PENDING)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].data();
  }

  async findByOrganization(
    organizationId: string,
    status?: OrganizationMembershipInvitationStatus,
  ): Promise<OrganizationMembershipInvitation[]> {
    let query = this.collection().where('organizationId', '==', organizationId);

    if (status) {
      query = query.where('status', '==', status);
    }

    query = query.orderBy('createdAt', 'desc');

    const snapshot = await query.get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((doc) => doc.data());
  }
}
