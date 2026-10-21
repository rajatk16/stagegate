export class EventResponseDto {
  id!: string;
  organizationId!: string;
  name!: string;
  slug!: string;
  status!: 'DRAFT';
  createdAt!: string;
  updatedAt!: string;
}

export class EventPageResponseDto {
  items!: EventResponseDto[];
  nextCursor!: string | null;
}
