import { IsString, IsUUID, Length } from 'class-validator';

export class CreateDecisionRoundDto {
  @IsUUID()
  reviewPeriodId: string;

  @IsString()
  @Length(1, 120)
  name: string;
}
