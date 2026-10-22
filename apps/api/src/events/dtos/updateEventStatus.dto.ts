import { IsEnum } from 'class-validator';

import { EVENT_STATUS } from '../enums';

export class UpdateEventStatusDto {
  @IsEnum(EVENT_STATUS)
  status!: EVENT_STATUS;
}
