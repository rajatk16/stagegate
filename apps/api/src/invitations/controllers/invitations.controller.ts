import type { DecodedIdToken } from 'firebase-admin/auth';
import {
  Get,
  Body,
  Post,
  Param,
  Query,
  Header,
  HttpCode,
  Controller,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';

import { InvitationsService } from '../services';
import { toAcceptOrganizationInvitationResponseDto } from '../mappers';
import {
  AcceptOrganizationInvitationDto,
  ListOrganizationInvitationsQueryDto,
  AcceptOrganizationInvitationResponseDto,
} from '../dtos';
import {
  CurrentUser,
  ThrottleUserWrites,
  RequireVerifiedEmail,
} from '../../auth/decorators';

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post(':invitationId/accept')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store')
  @RequireVerifiedEmail()
  @ThrottleUserWrites()
  async accept(
    @CurrentUser() user: DecodedIdToken,
    @Param('invitationId', new ParseUUIDPipe({ version: '4' }))
    invitationId: string,
    @Body() dto: AcceptOrganizationInvitationDto,
  ): Promise<AcceptOrganizationInvitationResponseDto> {
    const result = await this.invitationsService.accept(
      user,
      invitationId,
      dto.token,
    );

    return toAcceptOrganizationInvitationResponseDto(result);
  }

  @Get('received')
  @Header('Cache-Control', 'no-store')
  @RequireVerifiedEmail()
  listReceived(
    @CurrentUser() user: DecodedIdToken,
    @Query() query: ListOrganizationInvitationsQueryDto,
  ) {
    return this.invitationsService.listReceived(user, query.cursor);
  }

  @Post('received/:invitationId/accept')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store')
  @RequireVerifiedEmail()
  @ThrottleUserWrites()
  async acceptReceived(
    @CurrentUser() user: DecodedIdToken,
    @Param('invitationId', new ParseUUIDPipe({ version: '4' }))
    invitationId: string,
  ): Promise<AcceptOrganizationInvitationResponseDto> {
    const result = await this.invitationsService.acceptReceived(
      user,
      invitationId,
    );

    return toAcceptOrganizationInvitationResponseDto(result);
  }
}
