import { Injectable } from '@nestjs/common';
import { Timestamp } from 'firebase-admin/firestore';

import { OrganizationRole } from '@/auth';
import { FirebaseService } from '@/firebase';

import { MembershipStatus } from '../enums';
import { OrganizationMembership } from '../entities';
import { createOrganizationMembershipId } from '../utils';
import { organizationMembershipConverter } from '../converters';
import { ORGANIZATION_MEMBERSHIPS_COLLECTION } from '../constants';

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
    const membershipId = createOrganizationMembershipId(organizationId, userId);

    return this.findById(membershipId);
  }

  async findById(id: string): Promise<OrganizationMembership | null> {
    const snapshot = await this.collection().doc(id).get();

    if (!snapshot.exists) {
      return null;
    }

    return snapshot.data()!;
  }

  async findByUser(userId: string): Promise<OrganizationMembership[] | null> {
    const snapshot = await this.collection()
      .where('userId', '==', userId)
      .get();

    return snapshot.docs.map((doc) => doc.data());
  }

  async findByOrganization(
    organizationId: string,
  ): Promise<OrganizationMembership[]> {
    const snapshot = await this.collection()
      .where('organizationId', '==', organizationId)
      .get();

    return snapshot.docs.map((doc) => doc.data());
  }

  async findActiveByOrganization(
    organizationId: string,
  ): Promise<OrganizationMembership[]> {
    const snapshot = await this.collection()
      .where('organizationId', '==', organizationId)
      .where('status', '==', MembershipStatus.ACTIVE)
      .get();

    return snapshot.docs.map((doc) => doc.data());
  }

  async findActiveByUserAndOrganization(
    userId: string,
    organizationId: string,
  ): Promise<OrganizationMembership | null> {
    const membership = await this.findByUserAndOrganization(
      userId,
      organizationId,
    );

    if (!membership || membership.status !== MembershipStatus.ACTIVE) {
      return null;
    }

    return membership;
  }

  async findRemovedMembership(
    organizationId: string,
    userId: string,
  ): Promise<OrganizationMembership | null> {
    const snapshot = await this.collection()
      .where('organizationId', '==', organizationId)
      .where('userId', '==', userId)
      .where('status', '==', MembershipStatus.REMOVED)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].data();
  }

  async exists(userId: string, organizationId: string): Promise<boolean> {
    const membership = await this.findByUserAndOrganization(
      userId,
      organizationId,
    );

    return membership !== null;
  }

  async findActiveByUser(userId: string): Promise<OrganizationMembership[]> {
    const snapshot = await this.collection()
      .where('userId', '==', userId)
      .where('status', '==', MembershipStatus.ACTIVE)
      .get();

    return snapshot.docs.map((doc) => doc.data());
  }

  async update(
    id: string,
    updates: Partial<Pick<OrganizationMembership, 'roles' | 'status'>>,
  ): Promise<void> {
    await this.collection()
      .doc(id)
      .update({
        ...updates,
        updatedAt: Timestamp.now(),
      });
  }

  async delete(id: string): Promise<void> {
    await this.collection().doc(id).delete();
  }

  async findOwner(organizationId: string): Promise<OrganizationMembership> {
    const snapshot = await this.collection()
      .where('organizationId', '==', organizationId)
      .where('status', '==', MembershipStatus.ACTIVE)
      .where('roles', 'array-contains', OrganizationRole.OWNER)
      .limit(1)
      .get();

    return snapshot.docs[0].data();
  }

  async save(membership: OrganizationMembership): Promise<void> {
    await this.collection().doc(membership.id).set(membership);
  }
}
