import { EventSummaryDto } from './eventSummary.dto';

export class EventListResponseDto {
  items: EventSummaryDto[];
  nextCursor: string | null;
}
