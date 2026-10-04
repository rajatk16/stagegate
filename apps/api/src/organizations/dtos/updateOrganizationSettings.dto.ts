import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsUrl,
  Length,
  IsString,
  MaxLength,
  IsOptional,
  ValidateIf,
  Matches,
} from 'class-validator';

const trimText = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

const nullableText = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() || null : value;

const nullableColor = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim().toUpperCase() || null : value;

export class UpdateOrganizationSettingsDto {
  @Transform(trimText)
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @IsString()
  @Length(2, 120)
  name?: string;

  @Transform(nullableText)
  @IsOptional()
  @IsString()
  @MaxLength(1_000)
  description?: string | null;

  @Transform(nullableText)
  @IsOptional()
  @IsString()
  @MaxLength(2_048)
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    require_valid_protocol: true,
    disallow_auth: true,
  })
  websiteURL?: string | null;

  @Transform(nullableColor)
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/)
  primaryColor?: string | null;

  @Transform(nullableColor)
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/)
  secondaryColor?: string | null;
}
