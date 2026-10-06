import type { DecodedIdToken } from 'firebase-admin/auth';
import {
  Body,
  Post,
  Param,
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
  AcceptOrganizationInvitationResponseDto,
} from '../dtos';
import {
  CurrentUser,
  ThrottleUserWrites,
  RequireVerifiedEmail,
} from '../../auth';

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
}
