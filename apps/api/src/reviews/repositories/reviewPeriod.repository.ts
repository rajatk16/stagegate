import { Injectable } from '@nestjs/common';

import { FirebaseService } from '@/firebase';

import { ReviewPeriodStatus } from '../enums';
import { reviewPeriodConverter } from '../converters';
import { REVIEW_PERIODS_COLLECTION } from '../constants';

@Injectable()
export class ReviewPeriodRepository {
  constructor(private readonly firestore: FirebaseService) {}

  private collection() {
    return this.firestore.firestore
      .collection(REVIEW_PERIODS_COLLECTION)
      .withConverter(reviewPeriodConverter);
  }

  getDocumentReference(reviewPeriodId: string) {
    return this.collection().doc(reviewPeriodId);
  }

  async findById(reviewPeriodId: string) {
    const snapshot = await this.getDocumentReference(reviewPeriodId).get();

    return snapshot.exists ? snapshot.data()! : null;
  }

  async findByCfpId(cfpId: string) {
    const snapshot = await this.collection()
      .where('cfpId', '==', cfpId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => doc.data());
  }

  getOpenByCfpQuery(cfpId: string) {
    return this.collection()
      .where('cfpId', '==', cfpId)
      .where('status', '==', ReviewPeriodStatus.OPEN)
      .limit(1);
  }
}
