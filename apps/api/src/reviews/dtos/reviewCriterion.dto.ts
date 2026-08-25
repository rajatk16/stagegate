import {
  Max,
  Min,
  IsInt,
  IsUUID,
  Length,
  IsString,
  IsBoolean,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class ReviewCriterionDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  @Length(1, 120)
  label: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @IsInt()
  @Min(1)
  @Max(100)
  weight: number;

  @IsInt()
  @Min(0)
  minimumScore: number;

  @IsInt()
  @Min(1)
  maximumScore: number;

  @IsInt()
  @Min(1)
  displayOrder: number;

  @IsBoolean()
  required: boolean;
}
