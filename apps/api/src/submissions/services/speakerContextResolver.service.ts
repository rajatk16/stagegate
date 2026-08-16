import { Timestamp } from 'firebase-admin/firestore';
import { HttpStatus, Injectable } from '@nestjs/common';

import { CfpRepository } from '@/cfps';
import { EventRepository } from '@/events';
import { PublicVisibilityPolicyService } from '@/public';
import { OrganizationRepository } from '@/organizations';
import { ApplicationException, ErrorCode } from '@/common';

@Injectable()
export class SpeakerContextResolverService {
  constructor(
    private readonly cfpRepository: CfpRepository,
    private readonly eventRepository: EventRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly publicVisibilityPolicyService: PublicVisibilityPolicyService,
  ) {}

  async resolveAccessibleCfp(eventPublicId: string) {
    const event = await this.eventRepository.findByPublicId(eventPublicId);

    if (!event) {
      throw new ApplicationException(
        ErrorCode.CFP_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'CFP not found',
      );
    }

    const [organization, cfp] = await Promise.all([
      this.organizationRepository.findById(event.organizationId),
      this.cfpRepository.findByEventId(event.id),
    ]);

    if (!organization || !cfp) {
      throw new ApplicationException(
        ErrorCode.CFP_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'CFP not found',
      );
    }

    this.publicVisibilityPolicyService.assertEventVisible(organization, event);

    return {
      organization,
      event,
      cfp,
    };
  }

  async resolveOpenCfp(eventPublicId: string) {
    const context = await this.resolveAccessibleCfp(eventPublicId);

    this.publicVisibilityPolicyService.assertCfpVisible(
      context.organization,
      context.event,
      context.cfp,
      Timestamp.now(),
    );

    return context;
  }
}
