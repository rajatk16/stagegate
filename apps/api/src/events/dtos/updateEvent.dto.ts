import { IsString, Length } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class UpdateEventDto {
  @Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(2, 120)
  name!: string;
}
