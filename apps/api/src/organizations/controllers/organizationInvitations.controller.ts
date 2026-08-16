import { Controller, Param, Post } from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Authorized } from '@/swagger';
import { CurrentUser, type AuthenticatedUser } from '@/auth';

import { OrganizationApplicationService } from '../services';

@Authorized()
@ApiTags('Organizatio Invitations')
@Controller('organization-invitations')
export class OrganizationInvitationsController {
  constructor(
    private readonly organizationApplicationService: OrganizationApplicationService,
  ) {}

  @ApiOperation({
    summary: 'Accept an invitation to the organization',
  })
  @ApiNoContentResponse({
    description: 'Invitation accepted successfully',
  })
  @Post(':invitationId/accept')
  async acceptInvitation(
    @CurrentUser() user: AuthenticatedUser,
    @Param('invitationId') invitationId: string,
  ): Promise<void> {
    await this.organizationApplicationService.acceptInvitation(
      user,
      invitationId,
    );
  }

  @ApiOperation({
    summary: 'Decline an invitation to the organization',
  })
  @ApiNoContentResponse({
    description: 'Invitation declined successfully',
  })
  @Post(':invitationId/decline')
  async declineInvitation(
    @CurrentUser() user: AuthenticatedUser,
    @Param('invitationId') invitationId: string,
  ): Promise<void> {
    await this.organizationApplicationService.declineInvitation(
      user,
      invitationId,
    );
  }
}
