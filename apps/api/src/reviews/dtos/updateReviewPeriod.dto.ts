import {
  Max,
  Min,
  IsInt,
  Length,
  IsString,
  IsBoolean,
  IsISO8601,
  IsOptional,
} from 'class-validator';

export class UpdateReviewPeriodDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  name?: string | null;

  @IsOptional()
  @IsISO8601({ strict: true })
  opensAt?: string | null;

  @IsOptional()
  @IsISO8601({ strict: true })
  closesAt?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  requiredReviewsPerProposal?: number;

  @IsOptional()
  @IsBoolean()
  allowSubmittedReviewRevisions?: boolean;
}
