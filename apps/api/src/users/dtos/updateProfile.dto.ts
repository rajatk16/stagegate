import { Transform, TransformFnParams } from "class-transformer";
import { IsOptional, IsString, IsTimeZone, IsUrl, Length, MaxLength } from "class-validator";

const normalizeOptionalText = ({ value }: TransformFnParams): unknown => 
  typeof value === 'string' ? value.trim() || null : value;

export class UpdateProfileDto {
  @Transform(({ value }: TransformFnParams) => typeof value === 'string' ? value.trim() : value)
  @IsOptional()
  @IsString()
  @Length(1, 80)
  displayName?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    require_valid_protocol: true,
    disallow_auth: true
  })
  photoURL?: string | null;

  @Transform(normalizeOptionalText)
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  biography?: string | null;

  @Transform(normalizeOptionalText)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  affiliation?: string | null;

  @Transform(normalizeOptionalText)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @IsTimeZone()
  timezone?: string | null;
}
