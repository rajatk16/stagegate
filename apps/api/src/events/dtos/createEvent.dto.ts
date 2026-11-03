import { IsString, Length, Matches } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { SLUG_PATTERN } from '../../common/constants';

export class CreateEventDto {
  @Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(2, 120)
  name!: string;

  @Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @Length(3, 63)
  @Matches(SLUG_PATTERN)
  slug!: string;
}
