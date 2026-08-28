import { Injectable } from '@nestjs/common';

import { FirebaseService } from '@/firebase';

import { DECISION_ROUNDS_COLLECTION } from '../constants';
import { decisionRoundConverter } from '../converters';

@Injectable()
export class DecisionRoundRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

  private collection() {
    return this.firebaseService.firestore
      .collection(DECISION_ROUNDS_COLLECTION)
      .withConverter(decisionRoundConverter);
  }

  getDocumentReference(decisionRoundId: string) {
    return this.collection().doc(decisionRoundId);
  }

  getByReviewPeriodQuery(reviewPeriodId: string) {
    return this.collection()
      .where('reviewPeriodId', '==', reviewPeriodId)
      .orderBy('createdAt', 'desc');
  }

  getByEventQuery(eventId: string) {
    return this.collection()
      .where('eventId', '==', eventId)
      .orderBy('createdAt', 'desc');
  }
}
