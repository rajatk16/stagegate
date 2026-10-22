import { EVENT_STATUS } from '../enums';

export class EventResponseDto {
  id!: string;
  organizationId!: string;
  name!: string;
  slug!: string;
  status!: EVENT_STATUS;
  createdAt!: string;
  updatedAt!: string;
}

export class EventPageResponseDto {
  items!: EventResponseDto[];
  nextCursor!: string | null;
}
