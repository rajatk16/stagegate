import { Event, EventMembership } from '../models';
import { EventAuthority } from './eventAuthority.type';
import { EventPermission } from './eventPermission.type';
import { OrganizationMembership } from '../../organizations/models';

export interface EventScope {
  readonly actorUid: string;
  readonly organizationId: string;
  readonly eventId: string;
  readonly event: Event;
  readonly organizationMembership: OrganizationMembership | null;
  readonly eventMembership: EventMembership | null;
  readonly authority: EventAuthority;
  readonly permissions: readonly EventPermission[];
}
