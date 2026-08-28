import { Injectable } from '@nestjs/common';

import { FirebaseService } from '@/firebase';

import { ReviewSubmissionRevision } from '../entities';
import { createReviewSubmissionRevisionId } from '../utils';
import { reviewSubmissionRevisionConverter } from '../converters';
import { REVIEW_SUBMISSION_REVISIONS_COLLECTION } from '../constants';

@Injectable()
export class ReviewSubmissionRevisionRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

  private collection() {
    return this.firebaseService.firestore
      .collection(REVIEW_SUBMISSION_REVISIONS_COLLECTION)
      .withConverter(reviewSubmissionRevisionConverter);
  }

  getDocumentReference(assignmentId: string, revisionNumber: number) {
    return this.collection().doc(
      createReviewSubmissionRevisionId(assignmentId, revisionNumber),
    );
  }

  async findByReviewId(reviewId: string) {
    const snapshot = await this.collection()
      .where('reviewId', '==', reviewId)
      .orderBy('revisionNumber', 'desc')
      .get();

    return snapshot.docs.map((doc) => doc.data());
  }

  async create(revision: ReviewSubmissionRevision) {
    await this.getDocumentReference(
      revision.assignmentId,
      revision.revisionNumber,
    ).create(revision);
  }

  getByReviewPeriodAndProposalQuery(
    reviewPeriodId: string,
    proposalId: string,
  ) {
    return this.collection()
      .where('reviewPeriodId', '==', reviewPeriodId)
      .where('proposalId', '==', proposalId);
  }
}
