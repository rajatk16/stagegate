import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../firebase/services';
import {
  ORGANIZATION_MEMBERSHIPS_COLLECTION,
  ORGANIZATIONS_COLLECTION,
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

  getDocumentReference(organizationId: string, membershipId: string) {
    return this.getCollection(organizationId).doc(membershipId);
  }
}
