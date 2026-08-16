export class PublicEventDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  timezone: string;
  startsAt: string | null;
  endsAt: string | null;
}
