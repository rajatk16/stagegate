import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Authorized } from '@/swagger';
import { Event, CurrentEvent, EventContext } from '@/events';
import { Organization, OrganizationContext } from '@/organizations';
import {
  CurrentUser,
  Permissions,
  EventPermission,
  CurrentOrganization,
  type AuthenticatedUser,
} from '@/auth';

import { CfpApplicationService } from '../services';
import { CfpDetailsDto, CreateCfpDto, UpdateCfpDto } from '../dtos';

@Authorized()
@ApiTags('CFPs')
@OrganizationContext('organizationSlug')
@EventContext('eventSlug')
@Permissions(EventPermission.CFP_MANAGE)
@Controller('/organizations/:organizationSlug/events/:eventSlug/cfp')
export class CfpsController {
  constructor(private readonly cfpApplicationService: CfpApplicationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new CFP' })
  @ApiBody({ type: CreateCfpDto })
  @ApiResponse({ type: CfpDetailsDto })
  async createCfp(
    @CurrentOrganization() organization: Organization,
    @CurrentEvent() event: Event,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCfpDto,
  ) {
    return this.cfpApplicationService.createCfp(
      organization,
      event,
      user.userId,
      dto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get CFP for an event' })
  @ApiResponse({ type: CfpDetailsDto })
  async getCfp(@CurrentEvent() event: Event) {
    return this.cfpApplicationService.getCfp(event);
  }

  @Patch()
  @ApiOperation({ summary: 'Update a CFP' })
  @ApiBody({ type: UpdateCfpDto })
  @ApiResponse({ type: CfpDetailsDto })
  async updateCfp(
    @CurrentOrganization() organization: Organization,
    @CurrentEvent() event: Event,
    @Body() dto: UpdateCfpDto,
  ) {
    return this.cfpApplicationService.updateCfp(organization, event, dto);
  }

  @Post('open')
  @ApiOperation({ summary: 'Open a CFP' })
  @ApiResponse({ type: CfpDetailsDto })
  async openCfp(
    @CurrentOrganization() organization: Organization,
    @CurrentEvent() event: Event,
  ) {
    return this.cfpApplicationService.openCfp(organization, event);
  }

  @Post('close')
  @ApiOperation({ summary: 'Close a CFP' })
  @ApiResponse({ type: CfpDetailsDto })
  async closeCfp(
    @CurrentOrganization() organization: Organization,
    @CurrentEvent() event: Event,
  ) {
    return this.cfpApplicationService.closeCfp(organization, event);
  }
}
