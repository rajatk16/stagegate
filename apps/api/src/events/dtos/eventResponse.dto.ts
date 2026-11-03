import { EVENT_FORMAT } from '../enums/eventFormat.enum';
import { EVENT_STATUS } from '../enums/eventStatus.enum';

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
  submissionOpensAt!: string | null;
  submissionClosesAt!: string | null;
}

export class EventPageResponseDto {
  items!: EventResponseDto[];
  nextCursor!: string | null;
}
