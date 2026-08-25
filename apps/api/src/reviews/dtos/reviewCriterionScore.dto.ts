import {
  IsInt,
  IsUUID,
  IsString,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class ReviewCriterionScoreDto {
  @IsUUID()
  criterionId: string;

  @IsInt()
  score: number;

  @IsOptional()
  @IsString()
  @MaxLength(2_000)
  feedback?: string | null;
}
