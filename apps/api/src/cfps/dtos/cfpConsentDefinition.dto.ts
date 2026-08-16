import { IsString, MaxLength, MinLength } from 'class-validator';

export class CfpConsentDefinitionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  version: string;

  @IsString()
  @MinLength(1)
  @MaxLength(20_000)
  content: string;
}
