import { Type } from 'class-transformer';
import {
  Max,
  Min,
  IsInt,
  IsString,
  IsBoolean,
  IsISO8601,
  MaxLength,
  MinLength,
  IsOptional,
  IsTimeZone,
  ValidateNested,
  IsArray,
  ArrayMaxSize,
} from 'class-validator';

import { CfpConsentDefinitionDto } from './cfpConsentDefinition.dto';
import { CfpTrackDto } from './cfpTrack.dto';

export class CreateCfpDto {
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(20_000)
  description?: string | null;

  @IsOptional()
  @IsISO8601({ strict: true })
  opensAt?: string | null;

  @IsOptional()
  @IsISO8601({ strict: true })
  closesAt?: string | null;

  @IsOptional()
  @IsTimeZone()
  timezone?: string;

  @IsInt()
  @Min(1)
  @Max(20)
  maxSubmissionsPerSpeaker: number;

  @IsInt()
  @Min(1)
  @Max(20)
  maxSpeakersPerSubmission: number;

  @IsBoolean()
  allowDrafts: boolean;

  @IsBoolean()
  allowEditsWhileOpen: boolean;

  @IsBoolean()
  allowWithdrawals: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => CfpConsentDefinitionDto)
  requiredConsent?: CfpConsentDefinitionDto | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => CfpTrackDto)
  tracks?: CfpTrackDto[];
}
