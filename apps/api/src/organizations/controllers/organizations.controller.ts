import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

import { CurrentUser } from '@/auth/decorators';
import { Authorized } from '@/swagger/decorators';
import { Permissions } from '@/authorization/decorators';
import type { AuthenticatedUser } from '@/auth/interfaces';
import { OrganizationPermission } from '@/authorization/enums';

import {
  OrganizationsService,
  OrganizationApplicationService,
} from '../services';
import {
  CreateOrganizationDto,
  OrganizationDetailsDto,
  OrganizationSummaryDto,
  CreateOrganizationResponseDto,
} from '../dtos';
import { UpdateOrganizationDto } from '../dtos/updateOrganizaiton.dto';

@Authorized()
@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly organizationApplicationService: OrganizationApplicationService,
  ) {}

  @ApiOperation({
    summary: 'Create a new organization',
  })
  @ApiCreatedResponse({
    type: CreateOrganizationResponseDto,
  })
  @Post()
  async create(
    @Body() dto: CreateOrganizationDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CreateOrganizationResponseDto> {
    const organization = await this.organizationsService.createOrganization(
      dto,
      user.userId,
    );

    return {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      status: organization.status,
    };
  }

  @ApiOperation({
    summary: 'List organizations for the current user',
  })
  @ApiOkResponse({
    type: OrganizationSummaryDto,
    isArray: true,
  })
  @Get()
  async listOrganizations(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OrganizationSummaryDto[]> {
    return this.organizationApplicationService.getOrganizationsForUser(
      user.userId,
    );
  }

  @ApiOperation({
    summary: 'Get organization details',
  })
  @ApiOkResponse({
    type: OrganizationDetailsDto,
  })
  @Get(':organizationSlug')
  @Permissions(OrganizationPermission.ORGANIZATION_READ)
  async getOrganization(
    @Param('organizationSlug') organizationSlug: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OrganizationDetailsDto> {
    return this.organizationApplicationService.getOrganization(
      organizationSlug,
      user.userId,
    );
  }

  @ApiOperation({
    summary: 'Update organization details',
  })
  @ApiOkResponse({
    type: OrganizationDetailsDto,
  })
  @Patch(':organizationId')
  @Permissions(OrganizationPermission.ORGANIZATION_UPDATE)
  async updateOrganization(
    @Param('organizationId') organizationId: string,
    @Body() dto: UpdateOrganizationDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OrganizationDetailsDto> {
    return this.organizationApplicationService.updateOrganization(
      organizationId,
      user.userId,
      dto,
    );
  }
}
