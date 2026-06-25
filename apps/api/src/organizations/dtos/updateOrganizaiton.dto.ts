import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUrl,
  Matches,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
} from 'class-validator';

export class UpdateOrganizationDto {
  @ApiPropertyOptional({
    example: 'Google Developer Group Bengaluru',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: 'gdg-bengaluru',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug may only contain lowercase letters, numbers and hyphens.',
  })
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  websiteUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  logoUrl?: string | null;
}
