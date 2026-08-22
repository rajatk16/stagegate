import { Type } from 'class-transformer';
import {
  Max,
  Min,
  IsInt,
  Matches,
  IsString,
  IsOptional,
} from 'class-validator';

export class ReviewerWorkQueueQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 20;

  @IsOptional()
  @IsString()
  @Matches(/^[a-f0-9]{64}$/i, {
    message: 'cursor must be a valid assignment ID',
  })
  cursor?: string;
}
