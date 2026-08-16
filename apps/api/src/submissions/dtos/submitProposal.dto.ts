import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class SubmitProposalDto {
  @IsBoolean()
  @IsOptional()
  consentAccepted?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  consentVersion?: string;
}
