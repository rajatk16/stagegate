import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ReviewRecommendation, ReviewStatus } from '../enums';

export class ReviewerReviewCriterionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  label: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiProperty()
  weight: number;

  @ApiProperty()
  minimumScore: number;

  @ApiProperty()
  maximumScore: number;

  @ApiProperty()
  displayOrder: number;

  @ApiProperty()
  required: boolean;
}

export class ReviewerCriterionScoreResponseDto {
  @ApiProperty()
  criterionId: string;

  @ApiProperty()
  score: number;

  @ApiPropertyOptional()
  feedback: string | null;
}

export class ReviewerReviewResponseDto {
  @ApiProperty({ enum: ReviewStatus })
  status: ReviewStatus;

  @ApiProperty({
    type: [ReviewerCriterionScoreResponseDto],
  })
  criterionScores: ReviewerCriterionScoreResponseDto[];

  @ApiPropertyOptional()
  writtenFeedback: string | null;

  @ApiPropertyOptional({
    enum: ReviewRecommendation,
  })
  recommendation: ReviewRecommendation | null;

  @ApiProperty()
  currentRevisionNumber: number;

  @ApiPropertyOptional()
  submittedAt: string | null;
}

export class ReviewerReviewWorkspaceResponseDto {
  @ApiProperty({
    type: [ReviewerReviewCriterionDto],
  })
  rubric: ReviewerReviewCriterionDto[];

  @ApiPropertyOptional({
    type: ReviewerReviewResponseDto,
    nullable: true,
  })
  review: ReviewerReviewResponseDto | null;
}
