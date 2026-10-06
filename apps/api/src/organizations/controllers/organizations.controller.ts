import { memoryStorage } from 'multer';
import { type DecodedIdToken } from 'firebase-admin/auth';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  Get,
  Body,
  Post,
  Param,
  Patch,
  Query,
  Header,
  Delete,
  HttpCode,
  Controller,
  HttpStatus,
  UploadedFile,
  StreamableFile,
  UseInterceptors,
} from '@nestjs/common';

import { type OrganizationScope } from '../types';
import {
  OrganizationScoped,
  CurrentOrganization,
  RequireOrganizationPermissions,
} from '../decorators';
import {
  OrganizationsService,
  OrganizationLogoService,
  UploadedOrganizationLogo,
  OrganizationMembersService,
} from '../services';
import {
  InvitationsService,
  CreateOrganizationInvitationDto,
  OrganizationInvitationResponseDto,
  toOrganizationInvitationResponseDto,
} from '../../invitations';
import {
  CurrentUser,
  SensitiveAction,
  ThrottleUserWrites,
  RequireVerifiedEmail,
} from '../../auth';
import {
  toOrganizationResponseDto,
  toMyOrganizationsResponseDto,
  toOrganizationMemberResponseDto,
  toOrganizationMembersResponseDto,
  toOrganizationPrivateResponseDto,
  toOrganizationWithMembershipResponseDto,
} from '../mappers';
import {
  CreateOrganizationDto,
  OrganizationResponseDto,
  MyOrganizationsResponseDto,
  ListMyOrganizationsQueryDto,
  OrganizationMemberResponseDto,
  UpdateOrganizationSettingsDto,
  OrganizationPrivateResponseDto,
  OrganizationMembersResponseDto,
  UpdateOrganizationMemberRoleDto,
  ListOrganizationMembersQueryDto,
} from '../dtos';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly invitationsService: InvitationsService,
    private readonly organizationsService: OrganizationsService,
    private readonly organizationLogoService: OrganizationLogoService,
    private readonly organizationMembersService: OrganizationMembersService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Header('Cache-Control', 'no-store')
  @SensitiveAction('createOrganization')
  async create(
    @CurrentUser() user: DecodedIdToken,
    @Body() dto: CreateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    const creation = await this.organizationsService.create(user, dto);

    return toOrganizationResponseDto(creation);
  }

  @Get('me')
  @Header('Cache-Control', 'no-store')
  async listMine(
    @CurrentUser() user: DecodedIdToken,
    @Query() query: ListMyOrganizationsQueryDto,
  ): Promise<MyOrganizationsResponseDto> {
    const page = await this.organizationsService.listMine(user, query);

    return toMyOrganizationsResponseDto(page);
  }

  @Get(':organizationId')
  @OrganizationScoped()
  @RequireOrganizationPermissions('organization:read')
  @Header('Cache-Control', 'no-store')
  getOrganization(
    @CurrentOrganization() scope: OrganizationScope,
  ): OrganizationResponseDto {
    return toOrganizationWithMembershipResponseDto(scope);
  }

  @Patch(':organizationId/settings')
  @OrganizationScoped()
  @RequireOrganizationPermissions('organization:update')
  @RequireVerifiedEmail()
  @ThrottleUserWrites()
  @Header('Cache-Control', 'no-store')
  async updateSettings(
    @CurrentOrganization() scope: OrganizationScope,
    @Body() dto: UpdateOrganizationSettingsDto,
  ): Promise<OrganizationPrivateResponseDto> {
    const updated = await this.organizationsService.updateSettings(scope, dto);

    return toOrganizationPrivateResponseDto(updated);
  }

  @Post(':organizationId/logo')
  @HttpCode(HttpStatus.OK)
  @OrganizationScoped()
  @RequireOrganizationPermissions('organization:update')
  @RequireVerifiedEmail()
  @ThrottleUserWrites()
  @Header('Cache-Control', 'no-store')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 2 * 1024 * 1024,
        files: 1,
        fields: 0,
      },
    }),
  )
  async uploadLogo(
    @CurrentOrganization() scope: OrganizationScope,
    @UploadedFile() file: UploadedOrganizationLogo | undefined,
  ): Promise<OrganizationPrivateResponseDto> {
    return toOrganizationPrivateResponseDto(
      await this.organizationLogoService.upload(scope, file),
    );
  }

  @Get(':organizationId/logo')
  @OrganizationScoped()
  @RequireOrganizationPermissions('organization:read')
  @Header('Cache-Control', 'private no-store')
  async readLogo(
    @CurrentOrganization() scope: OrganizationScope,
  ): Promise<StreamableFile> {
    return new StreamableFile(await this.organizationLogoService.read(scope), {
      type: 'image/webp',
      disposition: 'inline',
    });
  }

  @Delete(':organizationId/logo')
  @HttpCode(HttpStatus.OK)
  @OrganizationScoped()
  @RequireOrganizationPermissions('organization:update')
  @RequireVerifiedEmail()
  @ThrottleUserWrites()
  @Header('Cache-control', 'no-store')
  async removeLogo(
    @CurrentOrganization() scope: OrganizationScope,
  ): Promise<OrganizationPrivateResponseDto> {
    return toOrganizationPrivateResponseDto(
      await this.organizationLogoService.remove(scope),
    );
  }

  @Get(':organizationId/members')
  @OrganizationScoped()
  @RequireOrganizationPermissions('organization:members:read')
  @Header('Cache-Control', 'no-store')
  async listMembers(
    @CurrentOrganization() scope: OrganizationScope,
    @Query() query: ListOrganizationMembersQueryDto,
  ): Promise<OrganizationMembersResponseDto> {
    const page = await this.organizationMembersService.list(scope, query);

    return toOrganizationMembersResponseDto(page);
  }

  @Patch(':organizationId/members/:uid/role')
  @OrganizationScoped()
  @RequireOrganizationPermissions('organization:members:manage')
  @RequireVerifiedEmail()
  @ThrottleUserWrites()
  @Header('Cache-Control', 'no-store')
  async changeMemberRole(
    @CurrentOrganization() scope: OrganizationScope,
    @Param('uid') uid: string,
    @Body() dto: UpdateOrganizationMemberRoleDto,
  ): Promise<OrganizationMemberResponseDto> {
    const membership = await this.organizationMembersService.changeRole(
      scope,
      uid,
      dto,
    );

    return toOrganizationMemberResponseDto(membership);
  }

  @Post(':organizationId/invitations')
  @HttpCode(HttpStatus.CREATED)
  @Header('Cache-Control', 'no-store')
  @RequireOrganizationPermissions('organization:members:manage')
  @SensitiveAction('inviteOrganizationMember')
  async createOrganizationInvitation(
    @CurrentOrganization() scope: OrganizationScope,
    @Body() dto: CreateOrganizationInvitationDto,
  ): Promise<OrganizationInvitationResponseDto> {
    const result = await this.invitationsService.create(scope, dto);

    return toOrganizationInvitationResponseDto(result);
  }
}
