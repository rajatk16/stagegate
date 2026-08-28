import { Injectable } from '@nestjs/common';
import { Timestamp } from 'firebase-admin/firestore';

import { ReviewAssignmentStatus } from '../enums';
import { ReviewAssignment, ReviewerWorkload } from '../entities';
import {
  ReviewAssignmentRepository,
  ReviewerWorkloadRepository,
} from '../repositories';

type BuildReviewerWorkloadInput = {
  transaction: FirebaseFirestore.Transaction;
  reviewPeriodId: string;
  reviewerUserId: string;
  now: Timestamp;
  assignmentOverrides?: ReviewAssignment[];
};

@Injectable()
export class ReviewerWorkloadProjectionService {
  constructor(
    private readonly reviewAssignmentRepository: ReviewAssignmentRepository,
    private readonly reviewerWorkloadRepository: ReviewerWorkloadRepository,
  ) {}

  async buildInTransaction(
    input: BuildReviewerWorkloadInput,
  ): Promise<ReviewerWorkload> {
    const {
      transaction,
      reviewPeriodId,
      reviewerUserId,
      now,
      assignmentOverrides = [],
    } = input;

    const workloadRef = this.reviewerWorkloadRepository.getDocumentReference(
      reviewPeriodId,
      reviewerUserId,
    );

    const [assignmentSnapshot, workloadSnapshot] = await Promise.all([
      transaction.get(
        this.reviewAssignmentRepository.getByReviewPeriodAndReviewerQuery(
          reviewPeriodId,
          reviewerUserId,
        ),
      ),
      transaction.get(workloadRef),
    ]);

    const assignments = this.mergeById(
      assignmentSnapshot.docs.map((document) => document.data()),
      assignmentOverrides,
    );

    const firstAssignment = assignments[0];

    if (!firstAssignment) {
      throw new Error(
        'Reviewer workload cannot be built without an assignment',
      );
    }

    const assignedCount = assignments.filter(
      (assignment) => assignment.status === ReviewAssignmentStatus.ASSIGNED,
    ).length;

    const inProgressCount = assignments.filter(
      (assignment) => assignment.status === ReviewAssignmentStatus.IN_PROGRESS,
    ).length;

    const completedCount = assignments.filter(
      (assignment) => assignment.status === ReviewAssignmentStatus.COMPLETED,
    ).length;

    const declinedCount = assignments.filter(
      (assignment) => assignment.status === ReviewAssignmentStatus.DECLINED,
    ).length;

    const revokedCount = assignments.filter(
      (assignment) => assignment.status === ReviewAssignmentStatus.REVOKED,
    ).length;

    const overdueAssignmentCount = assignments.filter(
      (assignment) =>
        (assignment.status === ReviewAssignmentStatus.ASSIGNED ||
          assignment.status === ReviewAssignmentStatus.IN_PROGRESS) &&
        assignment.dueAt !== null &&
        assignment.dueAt.toMillis() < now.toMillis(),
    ).length;

    return {
      id: workloadRef.id,

      eventId: firstAssignment.eventId,
      cfpId: firstAssignment.cfpId,
      reviewPeriodId,
      reviewerUserId,

      assignedCount,
      inProgressCount,
      completedCount,
      declinedCount,
      revokedCount,

      activeAssignmentCount: assignedCount + inProgressCount,
      overdueAssignmentCount,

      createdAt: workloadSnapshot.exists
        ? workloadSnapshot.data()!.createdAt
        : now,
      updatedAt: now,
    };
  }

  saveInTransaction(
    transaction: FirebaseFirestore.Transaction,
    workload: ReviewerWorkload,
  ): void {
    transaction.set(
      this.reviewerWorkloadRepository.getDocumentReference(
        workload.reviewPeriodId,
        workload.reviewerUserId,
      ),
      workload,
    );
  }

  private mergeById<T extends { id: string }>(
    persisted: T[],
    overrides: T[],
  ): T[] {
    const values = new Map<string, T>();

    for (const item of persisted) {
      values.set(item.id, item);
    }

    for (const item of overrides) {
      values.set(item.id, item);
    }

    return [...values.values()];
  }
}
