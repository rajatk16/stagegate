import { Type } from 'class-transformer';
import {
  IsEnum,
  IsString,
  MaxLength,
  IsOptional,
  ArrayMaxSize,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';

import { ReviewRecommendation } from '../enums';
import { ReviewCriterionScoreDto } from './reviewCriterionScore.dto';

export class SubmitReviewDto {
  @ValidateNested({ each: true })
  @Type(() => ReviewCriterionScoreDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  criterionScores: ReviewCriterionScoreDto[];

  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  writtenFeedback?: string | null;

  @IsEnum(ReviewRecommendation)
  recommendation: ReviewRecommendation;
}
