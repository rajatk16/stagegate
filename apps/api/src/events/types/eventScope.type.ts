import { Event } from '../models/event.model';
import { EventAuthority } from './eventAuthority.type';
import { EventPermission } from './eventPermission.type';
import { OrganizationMembership } from '../../organizations/models/organizationMembership.model';
import { EventMembership } from '../models/eventMembership.model';

export interface EventScope {
  readonly actorUid: string;
  readonly organizationId: string;
  readonly eventId: string;
  readonly event: Event;
  readonly eventMembership: EventMembership | null;
  readonly authority: EventAuthority;
  readonly organizationMembership: OrganizationMembership;
  readonly permissions: readonly EventPermission[];
}
