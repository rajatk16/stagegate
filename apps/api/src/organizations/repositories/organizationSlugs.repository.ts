import { Injectable } from '@nestjs/common';

import { organizationSlugConverter } from '../converters/organizationSlug.converter';
import { FirebaseService } from '../../firebase/services/firebase.service';
import { ORGANIZATION_SLUGS_COLLECTION } from '../constants';

@Injectable()
export class OrganizationSlugRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

  private getCollection() {
    return this.firebaseService.firestore
      .collection(ORGANIZATION_SLUGS_COLLECTION)
      .withConverter(organizationSlugConverter);
  }

  getDocumentReference(slug: string) {
    return this.getCollection().doc(slug);
  }
}
