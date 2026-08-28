import { FirebaseService } from '@/firebase';
import { Injectable } from '@nestjs/common';
import { REVIEWER_WORKLOADS_COLLECTION } from '../constants';
import { reviewerWorkloadConverter } from '../converters';
import { createReviewerWorkloadId } from '../utils';
import { ReviewerWorkload } from '../entities';

@Injectable()
export class ReviewerWorkloadRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

  private collection() {
    return this.firebaseService
      .getFirestore()
      .collection(REVIEWER_WORKLOADS_COLLECTION)
      .withConverter(reviewerWorkloadConverter);
  }

  getDocumentReference(reviewPeriodId: string, reviewerUserId: string) {
    return this.collection().doc(
      createReviewerWorkloadId(reviewPeriodId, reviewerUserId),
    );
  }

  getByReviewPeriodQuery(reviewPeriodId: string) {
    return this.collection().where('reviewPeriodId', '==', reviewPeriodId);
  }

  getByReviewPeriodAndReviewerQuery(
    reviewPeriodId: string,
    reviewerUserId: string,
  ) {
    return this.collection()
      .where('reviewPeriodId', '==', reviewPeriodId)
      .where('reviewerUserId', '==', reviewerUserId)
      .limit(1);
  }

  async findByReviewPeriod(
    reviewPeriodId: string,
  ): Promise<ReviewerWorkload[]> {
    const snapshot = await this.getByReviewPeriodQuery(reviewPeriodId).get();

    return snapshot.docs.map((doc) => doc.data());
  }
}
