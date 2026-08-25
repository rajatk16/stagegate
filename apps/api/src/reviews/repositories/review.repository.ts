import { Injectable } from '@nestjs/common';

import { FirebaseService } from '@/firebase';

import { Review } from '../entities';
import { reviewConverter } from '../converters';
import { REVIEWS_COLLECTION } from '../constants';

@Injectable()
export class ReviewRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

  private collection() {
    return this.firebaseService.firestore
      .collection(REVIEWS_COLLECTION)
      .withConverter(reviewConverter);
  }

  getDocumentReference(assignmentId: string) {
    return this.collection().doc(assignmentId);
  }

  async findByAssignmentId(assignmentId: string) {
    const snapshot = await this.getDocumentReference(assignmentId).get();

    return snapshot.exists ? snapshot.data() : null;
  }

  async create(review: Review) {
    await this.getDocumentReference(review.assignmentId).create(review);
  }

  async save(review: Review) {
    await this.getDocumentReference(review.assignmentId).set(review);
  }
}
