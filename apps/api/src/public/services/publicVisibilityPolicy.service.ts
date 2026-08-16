import { Timestamp } from 'firebase-admin/firestore';
import { HttpStatus, Injectable } from '@nestjs/common';

import { Cfp, CfpStatus } from '@/cfps';
import { Event, EventStatus } from '@/events';
import { ErrorCode, ApplicationException } from '@/common';
import { Organization, OrganizationStatus } from '@/organizations';

@Injectable()
export class PublicVisibilityPolicyService {
  assertEventVisible(organization: Organization, event: Event): void {
    if (
      organization.status !== OrganizationStatus.ACTIVE ||
      event.status !== EventStatus.PUBLISHED
    ) {
      throw new ApplicationException(
        ErrorCode.EVENT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Event not found',
      );
    }
  }

  assertCfpVisible(
    organization: Organization,
    event: Event,
    cfp: Cfp,
    now: Timestamp,
  ) {
    this.assertEventVisible(organization, event);

    const hasNotOpened =
      cfp.opensAt !== null && cfp.opensAt.toMillis() > now.toMillis();

    const hasClosedBySchedule =
      cfp.closesAt !== null && cfp.closesAt.toMillis() <= now.toMillis();

    if (cfp.status !== CfpStatus.OPEN || hasNotOpened || hasClosedBySchedule) {
      throw new ApplicationException(
        ErrorCode.CFP_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'CFP not found',
      );
    }
  }
}
