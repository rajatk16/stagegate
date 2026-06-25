import { Injectable } from '@nestjs/common';

import { FirebaseService } from '@/firebase/firebase.service';

import { OrganizationSlug } from '../entities';
import { organizationSlugConverter } from '../converters';
import { ORGANIZATION_SLUGS_COLLECTION } from '../constants';

@Injectable()
export class OrganizationSlugRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

  private collection() {
    return this.firebaseService.firestore
      .collection(ORGANIZATION_SLUGS_COLLECTION)
      .withConverter(organizationSlugConverter);
  }

  getDocumentReference(slug: string) {
    return this.collection().doc(slug);
  }

  async findBySlug(slug: string): Promise<OrganizationSlug | null> {
    const snapshot = await this.collection().doc(slug).get();

    if (!snapshot.exists) {
      return null;
    }

    return snapshot.data() as OrganizationSlug;
  }

  async exists(slug: string): Promise<boolean> {
    const snapshot = await this.collection().doc(slug).get();

    return snapshot.exists;
  }

  async delete(slug: string): Promise<void> {
    await this.collection().doc(slug).delete();
  }
}
