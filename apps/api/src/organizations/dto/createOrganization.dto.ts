import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;
}
