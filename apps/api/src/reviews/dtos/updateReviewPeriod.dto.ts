import { IsISO8601, IsOptional, IsString, Length } from 'class-validator';

export class UpdateReviewPeriodDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  name?: string | null;

  @IsOptional()
  @IsISO8601()
  opensAt?: string | null;

  @IsOptional()
  @IsISO8601()
  closesAt?: string | null;
}
