import { Timestamp } from 'firebase-admin/firestore';
import { HttpStatus, Injectable } from '@nestjs/common';

import { UserRepository } from '@/users';
import { Event, EventMembershipRepository } from '@/events';
import { ApplicationException, ErrorCode, toIso } from '@/common';

import { ReviewCoverageStatus } from '../enums';
import { ChairCoverageQueryDto, ChairCoverageResponseDto } from '../dtos';
import {
  ReviewPeriodRepository,
  ReviewAssignmentRepository,
  ReviewerWorkloadRepository,
  ReviewerEligibilityRepository,
  ProposalReviewScorecardRepository,
} from '../repositories';

@Injectable()
export class ChairCoverageApplicationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly reviewPeriodRepository: ReviewPeriodRepository,
    private readonly eventMembershipRepository: EventMembershipRepository,
    private readonly reviewAssignmentRepository: ReviewAssignmentRepository,
    private readonly reviewerWorkloadRepository: ReviewerWorkloadRepository,
    private readonly reviewerEligibilityRepository: ReviewerEligibilityRepository,
    private readonly proposalReviewScorecardRepository: ProposalReviewScorecardRepository,
  ) {}

  async getCoverage(
    event: Event,
    reviewPeriodId: string,
    query: ChairCoverageQueryDto,
  ): Promise<ChairCoverageResponseDto> {
    if (query.lowLoadThreshold >= query.highLoadThreshold) {
      throw new ApplicationException(
        ErrorCode.VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST,
        'lowLoadThreshold must be lower than highLoadThreshold',
      );
    }

    const reviewPeriod =
      await this.reviewPeriodRepository.findById(reviewPeriodId);

    if (!reviewPeriod || reviewPeriod.eventId !== event.id) {
      throw new ApplicationException(
        ErrorCode.REVIEW_PERIOD_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Review period not found',
      );
    }

    const now = Timestamp.now();

    const [
      workloads,
      activeReviewers,
      eligibleReviewers,
      scorecardSnapshot,
      overdueSnapshot,
    ] = await Promise.all([
      this.reviewerWorkloadRepository.findByReviewPeriod(reviewPeriod.id),
      this.eventMembershipRepository.findActiveReviewersByEvent(event.id),
      this.reviewerEligibilityRepository.findEligibleByEvent(event.id),
      this.proposalReviewScorecardRepository
        .getByReviewPeriodQuery(reviewPeriod.id)
        .get(),
      this.reviewAssignmentRepository
        .getOverdueByReviewPeriodQuery(reviewPeriod.id, now)
        .limit(query.alertLimit + 1)
        .get(),
    ]);

    const eligibleReviewerIds = new Set(
      eligibleReviewers.map((eligibility) => eligibility.userId),
    );

    const activeEligibleReviewerIds = activeReviewers
      .map((membership) => membership.userId)
      .filter((userId) => eligibleReviewerIds.has(userId));

    const users = await this.userRepository.findByIds(
      activeEligibleReviewerIds,
    );

    const userById = new Map(users.map((user) => [user.id, user]));

    const workloadByReviewerId = new Map(
      workloads.map((workload) => [workload.reviewerUserId, workload]),
    );

    const reviewerRows = activeEligibleReviewerIds.map((reviewerUserId) => {
      const workload = workloadByReviewerId.get(reviewerUserId);

      const activeAssignmentCount = workload?.activeAssignmentCount ?? 0;

      return {
        reviewerUserId,
        displayName:
          userById.get(reviewerUserId)?.displayName ?? 'Unknown Reviewer',
        assignedCount: workload?.assignedCount ?? 0,
        inProgressCount: workload?.inProgressCount ?? 0,
        completedCount: workload?.completedCount ?? 0,
        activeAssignmentCount,
        overdueAssignmentCount: workload?.overdueAssignmentCount ?? 0,
        loadBand:
          activeAssignmentCount <= query.lowLoadThreshold
            ? ('LOW' as const)
            : activeAssignmentCount >= query.highLoadThreshold
              ? ('HIGH' as const)
              : ('BALANCED' as const),
      };
    });

    const scorecards = scorecardSnapshot.docs.map((document) =>
      document.data(),
    );

    const scorecardByProposalId = new Map(
      scorecards.map((scorecard) => [scorecard.proposalId, scorecard]),
    );

    const overdueAssignments = overdueSnapshot.docs
      .slice(0, query.alertLimit)
      .map((document) => {
        const assignment = document.data();
        const scorecard = scorecardByProposalId.get(assignment.proposalId);

        return {
          assignmentId: assignment.id,
          proposalId: assignment.proposalId,
          proposalTitle: scorecard?.proposalTitle ?? 'Unknown Proposal',
          reviewerUserId: assignment.reviewerUserId,
          reviewerDisplayName:
            userById.get(assignment.reviewerUserId)?.displayName ??
            'Unknown Reviewer',
          status: assignment.status,
          dueAt: toIso(assignment.dueAt)!,
        };
      });
    return {
      summary: {
        reviewPeriodId: reviewPeriod.id,
        totalProposals: scorecards.length,
        unassignedProposalCount: scorecards.filter(
          (scorecard) =>
            scorecard.coverageStatus === ReviewCoverageStatus.UNASSIGNED,
        ).length,
        missingReviewProposalCount: scorecards.filter(
          (scorecard) =>
            scorecard.coverageStatus !== ReviewCoverageStatus.COMPLETE,
        ).length,
        overdueAssignmentCount: overdueSnapshot.size,
        eligibleReviewerCount: activeEligibleReviewerIds.length,
      },
      lowLoadReviewers: reviewerRows.filter(
        (reviewer) => reviewer.loadBand === 'LOW',
      ),
      highLoadReviewers: reviewerRows.filter(
        (reviewer) => reviewer.loadBand === 'HIGH',
      ),
      overdueAssignments,
    };
  }
}
