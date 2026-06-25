import { Get, Body, Post, Patch, UseGuards, Controller } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

import { Authorized } from '@/swagger/decorators';
import { Permissions } from '@/authorization/decorators';
import type { AuthenticatedUser } from '@/auth/interfaces';
import { OrganizationPermission } from '@/authorization/enums';
import { CurrentOrganization, CurrentUser } from '@/auth/decorators';

import { Organization } from '../entities';
import { OrganizationContext } from '../decorators';
import { OrganizationContextGuard } from '../guards';
import {
  OrganizationsService,
  OrganizationApplicationService,
} from '../services';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  OrganizationDetailsDto,
  OrganizationSummaryDto,
  CreateOrganizationResponseDto,
} from '../dtos';

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
  @UseGuards(OrganizationContextGuard)
  @OrganizationContext('organizationSlug')
  @Permissions(OrganizationPermission.ORGANIZATION_READ)
  getOrganization(
    @CurrentOrganization() organization: Organization,
  ): OrganizationDetailsDto {
    return this.organizationApplicationService.getOrganization(organization);
  }

  @ApiOperation({
    summary: 'Update organization details',
  })
  @ApiOkResponse({
    type: OrganizationDetailsDto,
  })
  @Patch(':organizationId')
  @UseGuards(OrganizationContextGuard)
  @OrganizationContext('organizationSlug')
  @Permissions(OrganizationPermission.ORGANIZATION_UPDATE)
  async updateOrganization(
    @CurrentOrganization() organization: Organization,
    @Body() dto: UpdateOrganizationDto,
  ): Promise<OrganizationDetailsDto> {
    return this.organizationApplicationService.updateOrganization(
      organization,
      dto,
    );
  }
}
