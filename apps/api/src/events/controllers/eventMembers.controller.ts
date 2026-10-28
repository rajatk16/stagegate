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
  ParseUUIDPipe,
} from '@nestjs/common';

import type { EventScope } from '../types';
import { EventMembersService } from '../services';
import { SensitiveAction } from '../../auth/decorators';
import { InvitationsService } from '../../invitations/services';
import {
  CreateEventInvitationDto,
  ListOrganizationInvitationsQueryDto,
} from '../../invitations/dtos';
import {
  EventScoped,
  CurrentEvent,
  RequireEventPermissions,
} from '../decorators';
import {
  ListEventMembersQueryDto,
  UpdateEventMemberRoleDto,
  UpdateEventMemberStatusDto,
} from '../dtos';

@Controller('organizations/:organizationId/events/:eventId')
@EventScoped()
export class EventMembersController {
  constructor(
    private readonly members: EventMembersService,
    private readonly invitations: InvitationsService,
  ) {}

  @Get('membership')
  @Header('Cache-Control', 'no-store')
  @RequireEventPermissions('event:read')
  current(@CurrentEvent() scope: EventScope) {
    return this.members.current(scope);
  }

  @Get('members')
  @Header('Cache-Control', 'no-store')
  @RequireEventPermissions('event:members:read')
  list(
    @CurrentEvent() scope: EventScope,
    @Query() query: ListEventMembersQueryDto,
  ) {
    return this.members.list(scope, query.limit, query.cursor);
  }

  @Patch('members/:uid/role')
  @Header('Cache-Control', 'no-store')
  @RequireEventPermissions('event:members:manage')
  @SensitiveAction('manageEventMembers')
  changeRole(
    @CurrentEvent() scope: EventScope,
    @Param('uid') uid: string,
    @Body() input: UpdateEventMemberRoleDto,
  ) {
    return this.members.mutate(scope, uid, {
      kind: 'role',
      role: input.role,
    });
  }

  @Patch('members/:uid/status')
  @Header('Cache-Control', 'no-store')
  @RequireEventPermissions('event:members:manage')
  @SensitiveAction('manageEventMembers')
  changeStatus(
    @CurrentEvent() scope: EventScope,
    @Param('uid') uid: string,
    @Body() input: UpdateEventMemberStatusDto,
  ) {
    return this.members.mutate(scope, uid, {
      kind: 'status',
      status: input.status,
    });
  }

  @Post('invitations')
  @HttpCode(HttpStatus.CREATED)
  @Header('Cache-Control', 'no-store')
  @RequireEventPermissions('event:members:manage')
  @SensitiveAction('inviteEventMember')
  invite(
    @CurrentEvent() scope: EventScope,
    @Body() input: CreateEventInvitationDto,
  ) {
    return this.invitations.createEvent(scope, input);
  }

  @Get('invitations')
  @Header('Cache-Control', 'no-store')
  @RequireEventPermissions('event:members:manage')
  listInvitations(
    @CurrentEvent() scope: EventScope,
    @Query() query: ListOrganizationInvitationsQueryDto,
  ) {
    return this.invitations.listEventPending(scope, query.cursor);
  }

  @Delete('invitations/:invitationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Header('Cache-Control', 'no-store')
  @RequireEventPermissions('event:members:manage')
  @SensitiveAction('manageEventMembers')
  async revokeInvitation(
    @CurrentEvent() scope: EventScope,
    @Param('invitationId', new ParseUUIDPipe({ version: '4' }))
    invitationId: string,
  ): Promise<void> {
    await this.invitations.revokeEvent(scope, invitationId);
  }
}
