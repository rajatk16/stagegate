import { FirebaseService } from '@/firebase/firebase.service';
import { Injectable } from '@nestjs/common';
import { ORGANIZATION_SLUGS_COLLECTION } from '../entities/organizationSlugs.constants';
import { organizationSlugConverter } from './organizationSlug.converter';
import { OrganizationSlug } from '../entities';

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
}
