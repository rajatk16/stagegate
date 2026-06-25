import { Injectable } from '@nestjs/common';
import { Timestamp } from 'firebase-admin/firestore';

import { FirebaseService } from '@/firebase/firebase.service';

import { Organization } from '../entities';
import { organizationConverter } from '../converters';
import { ORGANIZATIONS_COLLECTION } from '../constants';
import { OrganizationSlugRepository } from './organizationSlug.repository';

@Injectable()
export class OrganizationRepository {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly organizationSlugRepository: OrganizationSlugRepository,
  ) {}

  private collection() {
    return this.firebaseService.firestore
      .collection(ORGANIZATIONS_COLLECTION)
      .withConverter(organizationConverter);
  }

  getDocumentReference(id: string) {
    return this.collection().doc(id);
  }

  async create(organization: Organization): Promise<Organization> {
    await this.collection().doc(organization.id).set(organization);

    return organization;
  }

  async findById(id: string): Promise<Organization | null> {
    const snapshot = await this.collection().doc(id).get();

    if (!snapshot.exists) {
      return null;
    }

    return snapshot.data() as Organization;
  }

  async findByIds(organizationIds: string[]): Promise<Organization[]> {
    if (organizationIds.length === 0) {
      return [];
    }

    const snapshots = await Promise.all(
      organizationIds.map((id) => this.collection().doc(id).get()),
    );

    return snapshots
      .filter((snapshot) => snapshot.exists)
      .map((snapshot) => snapshot.data()!);
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const slugReservation =
      await this.organizationSlugRepository.findBySlug(slug);

    if (!slugReservation) {
      return null;
    }

    return this.findById(slugReservation.organizationId);
  }

  async update(id: string, updates: Partial<Organization>): Promise<void> {
    await this.collection()
      .doc(id)
      .update({
        ...updates,
        updatedAt: Timestamp.now(),
      });
  }

  async exists(organizationId: string): Promise<boolean> {
    const snapshot = await this.collection().doc(organizationId).get();

    return snapshot.exists;
  }
}
