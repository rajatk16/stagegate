import { Get, Body, Post, Param, Patch, Controller } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';

import { Authorized } from '@/swagger/decorators';
import { Permissions } from '@/authorization/decorators';
import type { AuthenticatedUser } from '@/auth/interfaces';
import { OrganizationPermission } from '@/authorization/enums';
import {
  CurrentUser,
  CurrentOrganization,
  CurrentOrganizationMembership,
} from '@/auth/decorators';

import { OrganizationContext } from '../decorators';
import { Organization, OrganizationMembership } from '../entities';
import {
  OrganizationsService,
  OrganizationApplicationService,
} from '../services';
import {
  CreateOrganizationDto,
  OrganizationMemberDto,
  UpdateOrganizationDto,
  OrganizationDetailsDto,
  OrganizationSummaryDto,
  UpdateOrganizationMemberDto,
  CreateMembershipInvitationDto,
  CreateOrganizationResponseDto,
  TransferOrganizationOwnershipDto,
  OrganizationMembershipInvitationDto,
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
  @Patch(':organizationSlug')
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

  @ApiOperation({
    summary: 'Archive an organization',
  })
  @ApiNoContentResponse({
    description: 'Organization archived successfully',
  })
  @Patch(':organizationSlug/archive')
  @OrganizationContext('organizationSlug')
  @Permissions(OrganizationPermission.ORGANIZATION_ARCHIVE)
  async archiveOrganization(
    @CurrentOrganization() organization: Organization,
  ): Promise<void> {
    await this.organizationApplicationService.archiveOrganization(organization);
  }

  @ApiOperation({
    summary: 'Restore an organization',
  })
  @ApiNoContentResponse({
    description: 'Organization restored successfully',
  })
  @Patch(':organizationSlug/restore')
  @OrganizationContext('organizationSlug')
  @Permissions(OrganizationPermission.ORGANIZATION_RESTORE)
  async restoreOrganization(
    @CurrentOrganization() organization: Organization,
  ): Promise<void> {
    await this.organizationApplicationService.restoreOrganization(organization);
  }

  @ApiOperation({
    summary: 'List organization members',
  })
  @ApiOkResponse({
    type: OrganizationMemberDto,
    isArray: true,
  })
  @Get(':organizationSlug/members')
  @OrganizationContext('organizationSlug')
  @Permissions(OrganizationPermission.MEMBER_READ)
  async getMembers(
    @CurrentOrganization() organization: Organization,
  ): Promise<OrganizationMemberDto[]> {
    return this.organizationApplicationService.getMembers(organization);
  }

  @ApiOperation({
    summary: 'Get current member details',
  })
  @ApiOkResponse({
    type: OrganizationMemberDto,
  })
  @Get(':organizationSlug/members/me')
  @OrganizationContext('organizationSlug')
  async getCurrentMember(
    @CurrentOrganizationMembership() membership: OrganizationMembership,
  ): Promise<OrganizationMemberDto> {
    return this.organizationApplicationService.getCurrentMember(membership);
  }

  @ApiOperation({
    summary: 'Invite a new member to the organization',
  })
  @ApiCreatedResponse({
    type: OrganizationMembershipInvitationDto,
  })
  @Post(':organizationSlug/members/invitations')
  @OrganizationContext('organizationSlug')
  @Permissions(OrganizationPermission.MEMBER_INVITE)
  async inviteMember(
    @CurrentOrganization() organization: Organization,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateMembershipInvitationDto,
  ): Promise<OrganizationMembershipInvitationDto> {
    return this.organizationApplicationService.inviteMember(
      organization,
      user.userId,
      dto,
    );
  }

  @ApiOperation({
    summary: 'Update member roles',
  })
  @ApiOkResponse({
    type: OrganizationMemberDto,
  })
  @Patch(':organizationSlug/members/:userId')
  @OrganizationContext('organizationSlug')
  @Permissions(OrganizationPermission.MEMBER_UPDATE)
  async updateMemberRoles(
    @CurrentOrganization() organization: Organization,
    @CurrentOrganizationMembership() membership: OrganizationMembership,
    @Param('userId') userId: string,
    @Body() dto: UpdateOrganizationMemberDto,
  ): Promise<OrganizationMemberDto> {
    return this.organizationApplicationService.updateMemberRoles(
      organization,
      membership,
      userId,
      dto,
    );
  }

  @ApiOperation({
    summary: 'Remove a member from the organization',
  })
  @ApiOkResponse({
    type: OrganizationMemberDto,
  })
  @Patch(':organizationSlug/members/:userId/remove')
  @OrganizationContext('organizationSlug')
  @Permissions(OrganizationPermission.MEMBER_REMOVE)
  async removeMember(
    @CurrentOrganization() organization: Organization,
    @CurrentOrganizationMembership() membership: OrganizationMembership,
    @Param('userId') userId: string,
  ): Promise<OrganizationMemberDto> {
    return this.organizationApplicationService.removeMember(
      organization,
      membership,
      userId,
    );
  }

  @ApiOperation({
    summary: 'Leave the organization',
  })
  @ApiNoContentResponse({
    description: 'Left the organization successfully',
  })
  @Post(':organizationSlug/members/leave')
  @OrganizationContext('organizationSlug')
  async leaveOrganization(
    @CurrentOrganization() organization: Organization,
    @CurrentOrganizationMembership() membership: OrganizationMembership,
  ): Promise<void> {
    return this.organizationApplicationService.leaveOrganization(
      organization,
      membership,
    );
  }

  @ApiOperation({
    summary: 'Transfer organization ownership',
  })
  @ApiOkResponse({
    type: OrganizationMemberDto,
  })
  @Patch(':organizationSlug/ownership/transfer')
  @OrganizationContext('organizationSlug')
  @Permissions(OrganizationPermission.MEMBER_UPDATE)
  async transferOwnership(
    @CurrentOrganization() organization: Organization,
    @CurrentOrganizationMembership() membership: OrganizationMembership,
    @Body() dto: TransferOrganizationOwnershipDto,
  ): Promise<OrganizationMemberDto> {
    return this.organizationApplicationService.transferOwnership(
      organization,
      membership,
      dto.userId,
    );
  }
}
