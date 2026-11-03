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
  ParseUUIDPipe,
  StreamableFile,
  UseInterceptors,
} from '@nestjs/common';

import { type OrganizationScope } from '../types/organizationScope.type';
import { UsersService } from '../../users/services/users.service';
import { OrganizationAuditReader } from '../../audit/services/organizationAuditReader.service';
import { InvitationsService } from '../../invitations/services/invitations.service';
import { toOrganizationInvitationResponseDto } from '../../invitations/mappers/invitationResponse.mappers';
import { ListOrganizationAuditQueryDto } from '../../audit/dtos/listOrganizationAuditQuery.dto';
import { OrganizationsService } from '../services/organizations.service';
import {
  OrganizationLogoService,
  UploadedOrganizationLogo,
} from '../services/organizationLogo.service';
import { OrganizationMembersService } from '../services/organizationMembers.service';
import { SensitiveAction } from '../../auth/decorators/sensitiveAction.decorator';
import { CurrentUser } from '../../auth/decorators/currentUser.decorator';
import { CreateOrganizationDto } from '../dtos/createOrganization.dto';
import { OrganizationResponseDto } from '../dtos/organizationResponse.dto';
import {
  toMyOrganizationsResponseDto,
  toOrganizationPrivateResponseDto,
  toOrganizationResponseDto,
  toOrganizationWithMembershipResponseDto,
} from '../mappers/organization.mapper';
import { ListMyOrganizationsQueryDto } from '../dtos/listMyOrganizationsQuery.dto';
import { MyOrganizationsResponseDto } from '../dtos/myOrganizationsResponse.dto';
import { OrganizationScoped } from '../decorators/organizationScoped.decorator';
import { RequireOrganizationPermissions } from '../decorators/requiredOrganizationPermissions.decorator';
import { CurrentOrganization } from '../decorators/currentOrganization.decorator';
import { RequireVerifiedEmail } from '../../auth/decorators/requireVerifiedEmail.decorator';
import { ThrottleUserWrites } from '../../auth/decorators/throttleUserWrites.decorator';
import { UpdateOrganizationSettingsDto } from '../dtos/updateOrganizationSettings.dto';
import { OrganizationPrivateResponseDto } from '../dtos/organizationPrivateResponse.dto';
import { ListOrganizationMembersQueryDto } from '../dtos/listOrganizationMembersQuery.dto';
import {
  OrganizationMemberResponseDto,
  OrganizationMembersResponseDto,
} from '../dtos/organizationMembersResponse.dto';
import {
  toOrganizationMemberResponseDto,
  toOrganizationMembersResponseDto,
} from '../mappers/organizationMember.mapper';
import { UpdateOrganizationMemberRoleDto } from '../dtos/updateOrganizationMemberRole.dto';
import { ListOrganizationInvitationsQueryDto } from '../../invitations/dtos/listOrganizationInvitationsQuery.dto';
import { CreateOrganizationInvitationDto } from '../../invitations/dtos/createOrganizationInvitation.dto';
import { OrganizationInvitationResponseDto } from '../../invitations/dtos/organizationInvitationResponse.dto';
import { UpdateOrganizationMemberStatusDto } from '../dtos/updateOrganizationMemberStatus.dto';
import { RequireRecentAuthentication } from '../../auth/decorators/requireRecentAuthentication.decorator';
import {
  TransferOrganizationOwnershipDto,
  TransferOrganizationOwnershipResponseDto,
} from '../dtos/transferOrganizationOwnership.dto';
import { OrganizationAuditPageResponseDto } from '../../audit/dtos/organizationAuditResponse.dto';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly usersService: UsersService,
    private readonly invitationsService: InvitationsService,
    private readonly organizationsService: OrganizationsService,
    private readonly organizationAuditReader: OrganizationAuditReader,
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

    return toOrganizationMembersResponseDto(page, scope.membership);
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

  @Get(':organizationId/invitations')
  @OrganizationScoped()
  @Header('Cache-Control', 'no-store')
  @RequireOrganizationPermissions('organization:members:manage')
  listOrganizationInvitations(
    @CurrentOrganization() scope: OrganizationScope,
    @Query() query: ListOrganizationInvitationsQueryDto,
  ) {
    return this.invitationsService.listPending(scope, query.cursor);
  }

  @Post(':organizationId/invitations')
  @OrganizationScoped()
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

  @Delete(':organizationId/invitations/:invitationId')
  @OrganizationScoped()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Header('Cache-Control', 'no-store')
  @RequireOrganizationPermissions('organization:members:manage')
  @RequireVerifiedEmail()
  @ThrottleUserWrites()
  async revoke(
    @CurrentOrganization() scope: OrganizationScope,
    @Param('invitationId', new ParseUUIDPipe({ version: '4' }))
    invitationId: string,
  ): Promise<void> {
    await this.invitationsService.revoke(scope, invitationId);
  }

  @Post(':organizationId/leave')
  @OrganizationScoped()
  @RequireOrganizationPermissions('organization:read')
  @RequireVerifiedEmail()
  @ThrottleUserWrites()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Header('Cache-Control', 'no-store')
  async leaveOrganization(
    @CurrentOrganization() scope: OrganizationScope,
  ): Promise<void> {
    await this.organizationMembersService.leave(scope);
  }

  @Patch(':organizationId/members/:uid/status')
  @OrganizationScoped()
  @RequireOrganizationPermissions('organization:members:manage')
  @RequireVerifiedEmail()
  @ThrottleUserWrites()
  @Header('Cache-Control', 'no-store')
  async changeMemberStatus(
    @CurrentOrganization() scope: OrganizationScope,
    @Param('uid') uid: string,
    @Body() dto: UpdateOrganizationMemberStatusDto,
  ): Promise<OrganizationMemberResponseDto> {
    const membership = await this.organizationMembersService.changeStatus(
      scope,
      uid,
      dto,
    );

    return toOrganizationMemberResponseDto(membership);
  }

  @Post(':organizationId/ownership/transfer')
  @HttpCode(HttpStatus.OK)
  @OrganizationScoped()
  @RequireOrganizationPermissions('organization:ownership:transfer')
  @SensitiveAction('transferOrganizationOwnership')
  @RequireRecentAuthentication()
  @Header('Cache-Control', 'no-store')
  async transferOwnership(
    @CurrentOrganization() scope: OrganizationScope,
    @CurrentUser() user: DecodedIdToken,
    @Body() dto: TransferOrganizationOwnershipDto,
  ): Promise<TransferOrganizationOwnershipResponseDto> {
    const result = await this.organizationMembersService.transferOwnership(
      scope,
      user,
      dto,
    );

    return {
      organizationId: result.organizationId,
      previousOwner: toOrganizationMemberResponseDto(result.previousOwner),
      newOwner: toOrganizationMemberResponseDto(result.newOwner),
    };
  }

  @Get(':organizationId/audit')
  @OrganizationScoped()
  @RequireOrganizationPermissions('organization:audit:read')
  @RequireVerifiedEmail()
  @Header('Cache-Control', 'no-store')
  async listOrganizationAudit(
    @CurrentOrganization() scope: OrganizationScope,
    @Query() query: ListOrganizationAuditQueryDto,
  ): Promise<OrganizationAuditPageResponseDto> {
    const page = await this.organizationAuditReader.list(scope, query);

    const identities = await this.usersService.getIdentitySummaries(
      page.items.map((event) => event.actorUid),
    );

    return {
      nextCursor: page.nextCursor,
      items: page.items.map((event) => {
        const identity = identities.get(event.actorUid);

        return {
          actorDisplayName: identity?.displayName ?? null,
          actorEmail: identity?.email ?? null,
          action: event.action,
          actorUid: event.actorUid,
          details: event.details,
          eventId: event.eventId,
          occurredAt: event.occurredAt,
          organizationId: event.organizationId,
          outcome: event.outcome,
        };
      }),
    };
  }
}
