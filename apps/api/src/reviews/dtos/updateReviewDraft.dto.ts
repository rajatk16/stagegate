import { Type } from 'class-transformer';
import {
  IsEnum,
  IsString,
  MaxLength,
  IsOptional,
  ArrayMaxSize,
  ValidateNested,
} from 'class-validator';

import { ReviewRecommendation } from '../enums';
import { ReviewCriterionScoreDto } from './reviewCriterionScore.dto';

export class UpdateReviewDraftDto {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ReviewCriterionScoreDto)
  @ArrayMaxSize(20)
  criterionScores?: ReviewCriterionScoreDto[];

  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  writtenFeedback?: string | null;

  @IsOptional()
  @IsEnum(ReviewRecommendation)
  recommendation?: ReviewRecommendation | null;
}
