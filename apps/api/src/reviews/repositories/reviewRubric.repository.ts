import { Injectable } from '@nestjs/common';

import { FirebaseService } from '@/firebase';

import { reviewRubricConverter } from '../converters';
import { REVIEW_RUBRICS_COLLECTION } from '../constants';

@Injectable()
export class ReviewRubricRepository {
  constructor(private readonly firestore: FirebaseService) {}

  private collection() {
    return this.firestore.firestore
      .collection(REVIEW_RUBRICS_COLLECTION)
      .withConverter(reviewRubricConverter);
  }

  getDocumentReference(cfpId: string) {
    return this.collection().doc(cfpId);
  }

  async findByCfpId(cfpId: string) {
    const snapshot = await this.getDocumentReference(cfpId).get();

    return snapshot.exists ? snapshot.data()! : null;
  }
}
