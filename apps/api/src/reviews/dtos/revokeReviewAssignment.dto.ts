import { IsString, MaxLength, MinLength } from 'class-validator';

export class RevokeReviewAssignmentDto {
  @IsString()
  @MinLength(3)
  @MaxLength(1_000)
  reason: string;
}
