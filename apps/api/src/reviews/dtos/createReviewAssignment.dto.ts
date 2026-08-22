import { IsUUID, IsISO8601, IsOptional } from 'class-validator';

export class CreateReviewAssignmentDto {
  @IsUUID()
  proposalId: string;

  @IsUUID()
  reviewerUserId: string;

  @IsOptional()
  @IsISO8601()
  dueAt?: string | null;
}
