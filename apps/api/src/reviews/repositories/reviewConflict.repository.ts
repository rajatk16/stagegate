import { Injectable } from '@nestjs/common';

import { FirebaseService } from '@/firebase';

import { createReviewConflictId } from '../utils';
import { reviewConflictConverter } from '../converters';
import { REVIEW_CONFLICTS_COLLECTION } from '../constants';

@Injectable()
export class ReviewConflictRepository {
  constructor(private readonly firestore: FirebaseService) {}

  private collection() {
    return this.firestore.firestore
      .collection(REVIEW_CONFLICTS_COLLECTION)
      .withConverter(reviewConflictConverter);
  }

  getDocumentReference(proposalId: string, reviewerUserId: string) {
    return this.collection().doc(
      createReviewConflictId(proposalId, reviewerUserId),
    );
  }

  async findByProposalAndReviewer(proposalId: string, reviewerUserId: string) {
    const snapshot = await this.getDocumentReference(
      proposalId,
      reviewerUserId,
    ).get();

    return snapshot.exists ? snapshot.data()! : null;
  }
}
