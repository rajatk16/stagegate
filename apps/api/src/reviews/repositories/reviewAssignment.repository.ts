import { HttpStatus, Injectable } from '@nestjs/common';

import { FirebaseService } from '@/firebase';
import { ApplicationException, ErrorCode } from '@/common';

import { ReviewAssignment } from '../entities';
import { ReviewAssignmentStatus } from '../enums';
import { createReviewAssignmentId } from '../utils';
import { reviewAssignmentConverter } from '../converters';
import { REVIEW_ASSIGNMENTS_COLLECTION } from '../constants';

type ReviewerWorkQueueOptions = {
  limit: number;
  cursor?: string;
};

type ReviewerWorkQueuePage = {
  items: ReviewAssignment[];
  nextCursor: string | null;
};

@Injectable()
export class ReviewAssignmentRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

  private collection() {
    return this.firebaseService.firestore
      .collection(REVIEW_ASSIGNMENTS_COLLECTION)
      .withConverter(reviewAssignmentConverter);
  }

  getDocumentReference(
    reviewPeriodId: string,
    proposalId: string,
    reviewerUserId: string,
  ) {
    return this.collection().doc(
      createReviewAssignmentId(reviewPeriodId, proposalId, reviewerUserId),
    );
  }

  getDocumentReferenceById(assignmentId: string) {
    return this.collection().doc(assignmentId);
  }

  async findByReviewerAndStatuses(
    eventId: string,
    reviewerUserId: string,
    statuses: ReviewAssignmentStatus[],
  ) {
    const snapshot = await this.collection()
      .where('eventId', '==', eventId)
      .where('reviewerUserId', '==', reviewerUserId)
      .where('status', 'in', statuses)
      .get();

    return snapshot.docs.map((doc) => doc.data());
  }

  async findActiveByProposalAndReviewer(
    reviewPeriodId: string,
    proposalId: string,
    reviewerUserId: string,
  ) {
    const snapshot = await this.collection()
      .where('reviewPeriodId', '==', reviewPeriodId)
      .where('proposalId', '==', proposalId)
      .where('reviewerUserId', '==', reviewerUserId)
      .where('status', 'in', [
        ReviewAssignmentStatus.ASSIGNED,
        ReviewAssignmentStatus.IN_PROGRESS,
      ])
      .get();

    return snapshot.docs.map((doc) => doc.data());
  }

  getActiveByEventAndReviewerQuery(eventId: string, reviewerUserId: string) {
    return this.collection()
      .where('eventId', '==', eventId)
      .where('reviewerUserId', '==', reviewerUserId)
      .where('status', 'in', [
        ReviewAssignmentStatus.ASSIGNED,
        ReviewAssignmentStatus.IN_PROGRESS,
      ]);
  }

  getActiveByProposalAndReviewerQuery(
    proposalId: string,
    reviewerUserId: string,
  ) {
    return this.collection()
      .where('proposalId', '==', proposalId)
      .where('reviewerUserId', '==', reviewerUserId)
      .where('status', 'in', [
        ReviewAssignmentStatus.ASSIGNED,
        ReviewAssignmentStatus.IN_PROGRESS,
      ]);
  }

  async findReviewerWorkQueuePage(
    eventId: string,
    reviewerUserId: string,
    options: ReviewerWorkQueueOptions,
  ): Promise<ReviewerWorkQueuePage> {
    const pageSize = Math.min(Math.max(options.limit, 1), 50);

    let query = this.collection()
      .where('eventId', '==', eventId)
      .where('reviewerUserId', '==', reviewerUserId)
      .where('status', 'in', [
        ReviewAssignmentStatus.ASSIGNED,
        ReviewAssignmentStatus.IN_PROGRESS,
      ])
      .orderBy('dueAt', 'asc')
      .orderBy('assignedAt', 'asc')
      .limit(pageSize + 1);

    if (options.cursor) {
      const cursorSnapshot = await this.getDocumentReferenceById(
        options.cursor,
      ).get();

      if (
        !cursorSnapshot.exists ||
        cursorSnapshot.data()!.eventId !== eventId ||
        cursorSnapshot.data()!.reviewerUserId !== reviewerUserId
      ) {
        throw new ApplicationException(
          ErrorCode.VALIDATION_ERROR,
          HttpStatus.BAD_REQUEST,
          'Invalid work queue cursor',
        );
      }

      query = query.startAfter(cursorSnapshot);
    }

    const snapshot = await query.get();

    const items = snapshot.docs
      .slice(0, pageSize)
      .map((document) => document.data());

    return {
      items,
      nextCursor:
        snapshot.docs.length > pageSize ? (items.at(-1)?.id ?? null) : null,
    };
  }
}
