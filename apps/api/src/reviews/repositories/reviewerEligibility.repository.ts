import { Injectable } from '@nestjs/common';

import { FirebaseService } from '@/firebase';

import { createReviewerEligbilityId } from '../utils';
import { reviewerEligibilityConverter } from '../converters';
import { REVIEWER_ELIGIBILITIES_COLLECTION } from '../constants';
import { ReviewerEligibilityStatus } from '../enums';

@Injectable()
export class ReviewerEligibilityRepository {
  constructor(private readonly firestore: FirebaseService) {}

  private collection() {
    return this.firestore.firestore
      .collection(REVIEWER_ELIGIBILITIES_COLLECTION)
      .withConverter(reviewerEligibilityConverter);
  }

  getDocumentReference(eventId: string, userId: string) {
    return this.collection().doc(createReviewerEligbilityId(eventId, userId));
  }

  async findByEventAndUser(eventId: string, userId: string) {
    const snapshot = await this.getDocumentReference(eventId, userId).get();

    return snapshot.exists ? snapshot.data()! : null;
  }

  async findEligibleByEvent(eventId: string) {
    const snapshot = await this.collection()
      .where('eventId', '==', eventId)
      .where('status', '==', ReviewerEligibilityStatus.ELIGIBLE)
      .get();

    return snapshot.docs.map((document) => document.data());
  }
}
