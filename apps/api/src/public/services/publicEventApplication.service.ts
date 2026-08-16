import { Timestamp } from 'firebase-admin/firestore';
import { HttpStatus, Injectable } from '@nestjs/common';

import { CfpRepository } from '@/cfps';
import { Event, EventRepository } from '@/events';
import { ErrorCode, ApplicationException } from '@/common';
import { Organization, OrganizationRepository } from '@/organizations';

import { PublicCfpDto, PublicEventDto } from '../dtos';
import { PublicCfpMapper, PublicEventMapper } from '../mappers';
import { PublicVisibilityPolicyService } from './publicVisibilityPolicy.service';

@Injectable()
export class PublicEventApplicationService {
  constructor(
    private readonly cfpRepository: CfpRepository,
    private readonly eventRepository: EventRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly publicVisibilityPolicyService: PublicVisibilityPolicyService,
  ) {}

  async getPublicEvent(eventPublicId: string): Promise<PublicEventDto> {
    const { event } = await this.resolveVisibleEvent(eventPublicId);
    return PublicEventMapper.toDto(event);
  }

  async getPublicCfp(eventPublicId: string): Promise<PublicCfpDto> {
    const { organization, event } =
      await this.resolveVisibleEvent(eventPublicId);

    const cfp = await this.cfpRepository.findByEventId(event.id);

    if (!cfp) {
      throw new ApplicationException(
        ErrorCode.CFP_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'CFP not found',
      );
    }

    this.publicVisibilityPolicyService.assertCfpVisible(
      organization,
      event,
      cfp,
      Timestamp.now(),
    );

    return PublicCfpMapper.toDto(cfp, event);
  }

  private async resolveVisibleEvent(eventPublicId: string): Promise<{
    organization: Organization;
    event: Event;
  }> {
    const event = await this.eventRepository.findByPublicId(eventPublicId);

    if (!event) {
      throw new ApplicationException(
        ErrorCode.EVENT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Event not found',
      );
    }

    const organization = await this.organizationRepository.findById(
      event.organizationId,
    );

    if (!organization) {
      throw new ApplicationException(
        ErrorCode.EVENT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Event not found',
      );
    }
    this.publicVisibilityPolicyService.assertEventVisible(organization, event);

    return { organization, event };
  }
}
