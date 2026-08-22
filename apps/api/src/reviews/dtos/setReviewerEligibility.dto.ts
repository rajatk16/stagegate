import {
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
  ValidateIf,
} from 'class-validator';

import { ReviewerEligibilityStatus } from '../enums';

export class SetReviewerEligibilityDto {
  @IsEnum(ReviewerEligibilityStatus)
  status: ReviewerEligibilityStatus;

  @ValidateIf(
    (dto: SetReviewerEligibilityDto) =>
      dto.status === ReviewerEligibilityStatus.INELIGIBLE,
  )
  @IsString()
  @MinLength(3)
  @MaxLength(1_000)
  reason?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(1_000)
  note?: string | null;
}
