import {
  ConflictStatus,
  ReviewPeriodStatus,
  ReviewAssignmentStatus,
  ReviewerEligibilityStatus,
} from '../enums';

export class ReviewCriterionResponseDto {
  id: string;
  label: string;
  description: string | null;
  weight: number;
  minimumScore: number;
  maximumScore: number;
  displayOrder: number;
  required: boolean;
}

export class ReviewRubricResponseDto {
  id: string;
  eventId: string;
  cfpId: string;
  version: number;
  criteria: ReviewCriterionResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export class ReviewPeriodResponseDto {
  id: string;
  eventId: string;
  cfpId: string;
  name: string;
  status: ReviewPeriodStatus;
  opensAt: string | null;
  closesAt: string | null;
  rubricVersion: number;
  rubricSnapshot: ReviewCriterionResponseDto[];
  createdAt: string;
  updatedAt: string;
  openedAt: string | null;
  closedAt: string | null;
}

export class ReviewerEligibilityResponseDto {
  id: string;
  eventId: string;
  userId: string;
  status: ReviewerEligibilityStatus;
  reason: string | null;
  updatedAt: string;
}

export class ReviewConflictResponseDto {
  id: string;
  proposalId: string;
  reviewerUserId: string;
  status: ConflictStatus;
  reason: string | null;
  declaredAt: string;
  resolvedAt: string | null;
  resolutionNote: string | null;
  updatedAt: string;
}

export class ReviewAssignmentResponseDto {
  id: string;
  eventId: string;
  cfpId: string;
  reviewPeriodId: string;
  proposalId: string;
  reviewerUserId: string;
  status: ReviewAssignmentStatus;
  dueAt: string | null;
  assignedBy: string;
  assignedAt: string;
  revokedAt: string | null;
  revokedBy: string | null;
  revokeReason: string | null;
}
