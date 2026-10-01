import { Transform, TransformFnParams } from 'class-transformer';
import {
  Max,
  Min,
  IsInt,
  Matches,
  IsString,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class ListMyOrganizationsQueryDto {
  @Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string' && /^[1-9]\d{0,2}$/.test(value)
      ? Number(value)
      : value,
  )
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @IsString()
  @MaxLength(1_024)
  @Matches(/^[A-Za-z0-9_-]+$/)
  cursor?: string;
}
