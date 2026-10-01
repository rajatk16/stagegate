import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../firebase/services';
import { ORGANIZATION_SLUGS_COLLECTION } from '../constants';
import { organizationSlugConverter } from '../converters';

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
