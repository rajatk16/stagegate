import { EVENT_FORMAT, EVENT_STATUS } from '../enums';

export class EventResponseDto {
  id!: string;
  name!: string;
  slug!: string;
  timezone!: string;
  status!: EVENT_STATUS;
  endsAt!: string | null;
  organizationId!: string;
  location!: string | null;
  startsAt!: string | null;
  description!: string | null;
  format!: EVENT_FORMAT | null;

  createdAt!: string;
  updatedAt!: string;
}

export class EventPageResponseDto {
  items!: EventResponseDto[];
  nextCursor!: string | null;
}
