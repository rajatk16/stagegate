import {
  Get,
  Body,
  Post,
  Param,
  Patch,
  Query,
  Controller,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Authorized } from '@/swagger';
import { Organization, OrganizationContext } from '@/organizations';
import {
  CurrentUser,
  Permissions,
  EventPermission,
  CurrentOrganization,
  type AuthenticatedUser,
  OrganizationPermission,
} from '@/auth';

import { Event, EventMembership } from '../entities';
import { EventApplicationService } from '../services';
import type { EventListOptions } from '../repositories';
import {
  CurrentEvent,
  EventContext,
  CurrentEventMembership,
} from '../decorators';
import {
  CreateEventDto,
  EventMemberDto,
  UpdateEventDto,
  EventDetailsDto,
  CreateEventMemberDto,
  EventListResponseDto,
  UpdateEventMemberDto,
} from '../dtos';

@Authorized()
@ApiTags('Events')
@Controller('/organizations/:organizationSlug/events')
export class EventsController {
  constructor(
    private readonly eventApplicationService: EventApplicationService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiBody({ type: CreateEventDto })
  @ApiResponse({ type: EventDetailsDto })
  @OrganizationContext('organizationSlug')
  @Permissions(OrganizationPermission.EVENT_CREATE)
  async createEvent(
    @CurrentOrganization() organization: Organization,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateEventDto,
  ) {
    return this.eventApplicationService.createEvent(
      organization,
      user.userId,
      dto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all events for an organization' })
  @ApiResponse({ type: EventListResponseDto })
  @OrganizationContext('organizationSlug')
  @Permissions(OrganizationPermission.ORGANIZATION_READ)
  async listEvents(
    @CurrentOrganization() organization: Organization,
    @Query() options: EventListOptions,
  ) {
    return this.eventApplicationService.listEvents(organization, options);
  }

  @Get(':eventSlug')
  @ApiOperation({ summary: 'Get an event by slug' })
  @ApiResponse({ type: EventDetailsDto })
  @OrganizationContext('organizationSlug')
  @EventContext('eventSlug')
  @Permissions(EventPermission.EVENT_READ)
  async getEvent(
    @CurrentOrganization() organization: Organization,
    @Param('eventSlug') eventSlug: string,
  ) {
    return this.eventApplicationService.getEvent(organization, eventSlug);
  }

  @Patch(':eventSlug')
  @ApiOperation({ summary: 'Update an event by slug' })
  @ApiBody({ type: UpdateEventDto })
  @ApiResponse({ type: EventDetailsDto })
  @OrganizationContext('organizationSlug')
  @EventContext('eventSlug')
  @Permissions(EventPermission.EVENT_UPDATE)
  async updateEvent(
    @CurrentOrganization() organization: Organization,
    @Param('eventSlug') eventSlug: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventApplicationService.updateEvent(
      organization,
      eventSlug,
      dto,
    );
  }

  @Patch(':eventSlug/archive')
  @ApiOperation({ summary: 'Archive an event by slug' })
  @ApiResponse({ type: EventDetailsDto })
  @OrganizationContext('organizationSlug')
  @EventContext('eventSlug')
  @Permissions(EventPermission.EVENT_ARCHIVE)
  async archiveEvent(
    @CurrentOrganization() organization: Organization,
    @Param('eventSlug') eventSlug: string,
  ) {
    return this.eventApplicationService.archiveEvent(organization, eventSlug);
  }

  @Get(':eventSlug/members')
  @ApiOperation({ summary: 'Get all members of an event' })
  @ApiResponse({ type: [EventMemberDto] })
  @OrganizationContext('organizationSlug')
  @EventContext('eventSlug')
  @Permissions(EventPermission.EVENT_MEMBER_READ)
  async listMembers(@CurrentEvent() event: Event) {
    return this.eventApplicationService.listMembers(event);
  }

  @Post(':eventSlug/members')
  @ApiOperation({ summary: 'Add a new member to an event' })
  @ApiBody({ type: CreateEventMemberDto })
  @ApiResponse({ type: EventMemberDto })
  @OrganizationContext('organizationSlug')
  @EventContext('eventSlug')
  @Permissions(EventPermission.EVENT_MEMBER_MANAGE)
  async addMember(
    @CurrentOrganization() organization: Organization,
    @CurrentEvent() event: Event,
    @CurrentEventMembership() eventMembership: EventMembership,
    @Body() dto: CreateEventMemberDto,
  ) {
    return this.eventApplicationService.addMember(
      organization,
      event,
      eventMembership,
      dto,
    );
  }

  @Patch(':eventSlug/members/:userId')
  @ApiOperation({ summary: 'Update the role of a member by user ID' })
  @ApiBody({ type: UpdateEventMemberDto })
  @ApiResponse({ type: EventMemberDto })
  @OrganizationContext('organizationSlug')
  @EventContext('eventSlug')
  @Permissions(EventPermission.EVENT_MEMBER_MANAGE)
  async updateMember(
    @CurrentEvent() event: Event,
    @CurrentEventMembership() eventMembership: EventMembership,
    @Param('userId') userId: string,
    @Body() dto: UpdateEventMemberDto,
  ) {
    return this.eventApplicationService.updateMemberRole(
      event,
      eventMembership,
      userId,
      dto,
    );
  }

  @Patch(':eventSlug/members/:userId/remove')
  @ApiOperation({ summary: 'Remove a member by user ID' })
  @ApiResponse({ type: EventMemberDto })
  @OrganizationContext('organizationSlug')
  @EventContext('eventSlug')
  @Permissions(EventPermission.EVENT_MEMBER_MANAGE)
  async removeMember(
    @CurrentEvent() event: Event,
    @CurrentEventMembership() eventMembership: EventMembership,
    @Param('userId') userId: string,
  ) {
    return this.eventApplicationService.removeMember(
      event,
      eventMembership,
      userId,
    );
  }

  @Patch(':eventSlug/publish')
  @ApiOperation({ summary: 'Publish an event by slug' })
  @ApiResponse({ type: EventDetailsDto })
  @OrganizationContext('organizationSlug')
  @EventContext('eventSlug')
  @Permissions(EventPermission.EVENT_PUBLISH)
  async publishEvent(
    @CurrentOrganization() organization: Organization,
    @Param('eventSlug') eventSlug: string,
  ) {
    return this.eventApplicationService.publishEvent(organization, eventSlug);
  }
}
