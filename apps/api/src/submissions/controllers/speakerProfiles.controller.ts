import { Authorized } from '@/swagger';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Get,
  Put,
  Body,
  Param,
  Controller,
  ParseUUIDPipe,
} from '@nestjs/common';

import { type AuthenticatedUser, CurrentUser } from '@/auth';

import { SpeakerProfileService } from '../services';
import { SpeakerProfileDto, UpsertSpeakerProfileDto } from '../dtos';

@Authorized()
@ApiTags('Speaker workspace')
@Controller('/speaker/events/:eventPublicId/profile')
export class SpeakerProfilesController {
  constructor(private readonly speakerProfileService: SpeakerProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get my speaker profile for a CFP' })
  @ApiResponse({ type: SpeakerProfileDto })
  async getMyProfile(
    @Param('eventPublicId', new ParseUUIDPipe({ version: '4' }))
    eventPublicId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SpeakerProfileDto> {
    return this.speakerProfileService.getMyProfile(eventPublicId, user.userId);
  }

  @Put()
  @ApiOperation({ summary: 'Create or replace my speaker profile for a CFP' })
  @ApiBody({ type: UpsertSpeakerProfileDto })
  @ApiResponse({ type: SpeakerProfileDto })
  async upsertMyProfile(
    @Param('eventPublicId', new ParseUUIDPipe({ version: '4' }))
    eventPublicId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpsertSpeakerProfileDto,
  ): Promise<SpeakerProfileDto> {
    return this.speakerProfileService.upsertProfile(
      eventPublicId,
      user.userId,
      dto,
    );
  }
}
