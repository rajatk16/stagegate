import { ReviewAssignmentStatus } from '../enums';

export class ChairCoverageSummaryResponseDto {
  reviewPeriodId: string;
  totalProposals: number;
  unassignedProposalCount: number;
  missingReviewProposalCount: number;
  overdueAssignmentCount: number;
  eligibleReviewerCount: number;
}

export class ChairReviewerWorkloadResponseDto {
  reviewerUserId: string;
  displayName: string;

  assignedCount: number;
  inProgressCount: number;
  completedCount: number;
  activeAssignmentCount: number;
  overdueAssignmentCount: number;

  loadBand: 'LOW' | 'BALANCED' | 'HIGH';
}

export class ChairOverdueAssignmentResponseDto {
  assignmentId: string;
  proposalId: string;
  proposalTitle: string;
  reviewerUserId: string;
  reviewerDisplayName: string;
  status: ReviewAssignmentStatus;
  dueAt: string;
}

export class ChairCoverageResponseDto {
  summary: ChairCoverageSummaryResponseDto;
  lowLoadReviewers: ChairReviewerWorkloadResponseDto[];
  highLoadReviewers: ChairReviewerWorkloadResponseDto[];
  overdueAssignments: ChairOverdueAssignmentResponseDto[];
}
