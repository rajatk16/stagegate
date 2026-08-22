import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, ValidateNested } from 'class-validator';
import { ReviewCriterionDto } from './reviewCriterion.dto';

export class UpsertReviewRubricDto {
  @ValidateNested({ each: true })
  @Type(() => ReviewCriterionDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  criteria: ReviewCriterionDto[];
}
