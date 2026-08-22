import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ProposalFormat } from '@/submissions';

import { ReviewAssignmentStatus } from '../enums';

export class ReviewerQueueProposalDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  abstract: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiProperty({ enum: ProposalFormat })
  format: ProposalFormat;

  @ApiPropertyOptional()
  durationMinutes: number | null;

  @ApiProperty()
  language: string;
}

export class ReviewerWorkQueueItemDto {
  @ApiProperty()
  assignmentId: string;

  @ApiProperty()
  reviewPeriodId: string;

  @ApiProperty({ enum: ReviewAssignmentStatus })
  assignmentStatus: ReviewAssignmentStatus;

  @ApiProperty()
  assignedAt: string;

  @ApiPropertyOptional()
  dueAt: string | null;

  @ApiProperty({ type: ReviewerQueueProposalDto })
  proposal: ReviewerQueueProposalDto;
}

export class ReviewerWorkQueueResponseDto {
  @ApiProperty({ type: [ReviewerWorkQueueItemDto] })
  items: ReviewerWorkQueueItemDto[];

  @ApiPropertyOptional()
  nextCursor: string | null;
}
