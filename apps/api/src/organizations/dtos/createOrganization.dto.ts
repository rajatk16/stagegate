import { IsString, Length, Matches } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

import { normalizeOrganizationSlug } from '../utils';
import { ORGANIZATION_SLUG_PATTERN } from '../constants';

export class CreateOrganizationDto {
  @Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(2, 120)
  name!: string;

  @Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string' ? normalizeOrganizationSlug(value) : value,
  )
  @IsString()
  @Length(3, 63)
  @Matches(ORGANIZATION_SLUG_PATTERN)
  slug!: string;
}
