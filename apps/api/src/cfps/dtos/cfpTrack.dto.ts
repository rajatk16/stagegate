import {
  Max,
  Min,
  IsInt,
  IsUUID,
  Length,
  IsString,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CfpTrackDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  @Length(1, 120)
  label: string;

  @IsInt()
  @Min(1)
  @Max(20)
  displayOrder: number;

  @IsBoolean()
  active: boolean;
}
