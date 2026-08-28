import { Injectable } from '@nestjs/common';
import { Timestamp } from 'firebase-admin/firestore';

import { Proposal } from '@/submissions';

import { ReviewScorecardDomainService } from './reviewScorecardDomain.service';
import {
  ReviewPeriod,
  ReviewConflict,
  ReviewAssignment,
  ReviewSubmissionRevision,
  ProposalReviewScorecard,
} from '../entities';
import {
  ReviewConflictRepository,
  ReviewAssignmentRepository,
  ProposalReviewScorecardRepository,
  ReviewSubmissionRevisionRepository,
} from '../repositories';

type ScorecardProjectionOverrides = {
  conflicts?: ReviewConflict[];
  assignments?: ReviewAssignment[];
  submittedRevisions?: ReviewSubmissionRevision[];
};

type RebuildProposalScorecardInput = {
  now: Timestamp;
  proposal: Proposal;
  reviewPeriod: ReviewPeriod;
  overrides?: ScorecardProjectionOverrides;
  transaction: FirebaseFirestore.Transaction;
};

@Injectable()
export class ProposalReviewScorecardProjectionService {
  constructor(
    private readonly reviewConflictRepository: ReviewConflictRepository,
    private readonly reviewAssignmentRepository: ReviewAssignmentRepository,
    private readonly reviewScorecardDomainService: ReviewScorecardDomainService,
    private readonly proposalReviewScorecardRepository: ProposalReviewScorecardRepository,
    private readonly reviewSubmissionRevisionRepository: ReviewSubmissionRevisionRepository,
  ) {}

  async buildInTransaction(input: RebuildProposalScorecardInput) {
    const { transaction, proposal, reviewPeriod, now, overrides = {} } = input;

    const scorecardRef =
      this.proposalReviewScorecardRepository.getDocumentReference(
        reviewPeriod.id,
        proposal.id,
      );

    const [
      assignmentSnapshot,
      conflictSnapshot,
      revisionSnapshot,
      scorecardSnapshot,
    ] = await Promise.all([
      transaction.get(
        this.reviewAssignmentRepository.getByReviewPeriodAndProposalQuery(
          reviewPeriod.id,
          proposal.id,
        ),
      ),
      transaction.get(
        this.reviewConflictRepository.getByProposalQuery(proposal.id),
      ),
      transaction.get(
        this.reviewSubmissionRevisionRepository.getByReviewPeriodAndProposalQuery(
          reviewPeriod.id,
          proposal.id,
        ),
      ),
      transaction.get(scorecardRef),
    ]);

    const scorecard = this.reviewScorecardDomainService.build({
      proposal,
      reviewPeriod,
      assignments: this.mergeById(
        assignmentSnapshot.docs.map((doc) => doc.data()),
        overrides.assignments ?? [],
      ),
      conflicts: this.mergeById(
        conflictSnapshot.docs.map((doc) => doc.data()),
        overrides.conflicts ?? [],
      ),
      submittedRevisions: this.mergeById(
        revisionSnapshot.docs.map((doc) => doc.data()),
        overrides.submittedRevisions ?? [],
      ),
      existingScorecard: scorecardSnapshot.exists
        ? scorecardSnapshot.data()!
        : null,
      now,
    });

    return scorecard;
  }

  saveInTransaction(
    transaction: FirebaseFirestore.Transaction,
    scorecard: ProposalReviewScorecard,
  ) {
    transaction.set(
      this.proposalReviewScorecardRepository.getDocumentReference(
        scorecard.reviewPeriodId,
        scorecard.proposalId,
      ),
      scorecard,
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
