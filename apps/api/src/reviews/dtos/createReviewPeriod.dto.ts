import { IsUUID, IsISO8601, IsOptional, IsString } from 'class-validator';

export class CreateReviewPeriodDto {
  @IsUUID()
  proposalId: string;

  @IsUUID()
  reviewerUserId: string;

  @IsOptional()
  @IsISO8601({ strict: true })
  dueAt?: string | null;

  @IsString()
  name: string;

  @IsISO8601({ strict: true })
  opensAt: string;

  @IsISO8601({ strict: true })
  closesAt: string;
}
