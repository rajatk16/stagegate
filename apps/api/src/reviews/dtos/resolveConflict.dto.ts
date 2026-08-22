import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { ConflictStatus } from '../enums';

export class ResolveConflictDto {
  @IsEnum([ConflictStatus.CONFIRMED, ConflictStatus.DISMISSED])
  status: ConflictStatus.CONFIRMED | ConflictStatus.DISMISSED;

  @IsOptional()
  @IsString()
  @MaxLength(2_000)
  reason?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2_000)
  resolutionNote?: string | null;
}
