import {
  Get,
  Body,
  Param,
  Patch,
  Query,
  Header,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import type { EventScope } from '../types/eventScope.type';
import { EventMembersService } from '../services/eventMembers.service';
import { SensitiveAction } from '../../auth/decorators/sensitiveAction.decorator';
import {
  ListEventMembersQueryDto,
  UpdateEventMemberRoleDto,
  UpdateEventMemberStatusDto,
} from '../dtos/eventMembership.dto';
import { AddEventMemberDto } from '../dtos/addEventMember.dto';
import { EventScoped } from '../decorators/eventScoped.decorator';
import { RequireEventPermissions } from '../decorators/requireEventPermissions.decorator';
import { CurrentEvent } from '../decorators/currentEvent.decorator';

@Controller('organizations/:organizationId/events/:eventId')
@EventScoped()
export class EventMembersController {
  constructor(private readonly members: EventMembersService) {}

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

  @Post('members')
  @HttpCode(HttpStatus.CREATED)
  @Header('Cache-Control', 'no-store')
  @RequireEventPermissions('event:members:manage')
  @SensitiveAction('manageEventMembers')
  add(@CurrentEvent() scope: EventScope, @Body() input: AddEventMemberDto) {
    return this.members.add(scope, input);
  }
}
