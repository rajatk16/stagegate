import {
  IsUrl,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
} from 'class-validator';

export class UpsertSpeakerProfileDto {
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  displayName: string;

  @IsOptional()
  @IsString()
  @MaxLength(5_000)
  biography?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  organization?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  jobTitle?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  location?: string | null;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(2_048)
  websiteUrl?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  pronouns?: string | null;
}
