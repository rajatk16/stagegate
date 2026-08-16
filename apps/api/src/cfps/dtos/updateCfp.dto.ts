import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';
import { IsISO8601, IsOptional, ValidateNested } from 'class-validator';

import { CreateCfpDto } from './createCfp.dto';
import { CfpConsentDefinitionDto } from './cfpConsentDefinition.dto';

export class UpdateCfpDto extends PartialType(CreateCfpDto) {
  @IsOptional()
  @IsISO8601({ strict: true })
  opensAt?: string | null;

  @IsOptional()
  @IsISO8601({ strict: true })
  closesAt?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => CfpConsentDefinitionDto)
  requiredConsent?: CfpConsentDefinitionDto | null;
}
