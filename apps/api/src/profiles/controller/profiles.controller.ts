import {
  Get,
  Req,
  Body,
  Patch,
  Delete,
  Header,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
  UseFilters,
} from '@nestjs/common';

import {
  UserProfileResponse,
  userProfileResponseSchema,
} from '@stagegate/contracts';

import { ProfilesService } from '../services/profiles.service';
import { ProfileDocument } from '../converter/profileDocument.converter';
import { ApiExceptionFilter } from '../../common/filters/apiException.filter';
import { ActiveIdentityGuard } from '../../identity/guards/activeIdentity.guard';
import { FirebaseIdentityGuard } from '../../identity/guards/firebaseIdentity.guard';
import { type ActiveIdentityRequest } from '../../identity/types/activeIdentityRequest.type';

const profileResponse = (
  userId: string,
  document?: ProfileDocument,
): UserProfileResponse => {
  return userProfileResponseSchema.parse({
    userId,
    profile: document
      ? { ...document, updatedAt: document.updatedAt.toDate().toISOString() }
      : null,
  });
};

@Controller('me/profile')
@UseGuards(FirebaseIdentityGuard, ActiveIdentityGuard)
@UseFilters(ApiExceptionFilter)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  async getProfile(@Req() request: ActiveIdentityRequest) {
    const { stageGateUserId } = request;
    return profileResponse(
      stageGateUserId,
      await this.profilesService.find(stageGateUserId),
    );
  }

  @Patch()
  @Header('Cache-Control', 'no-store')
  async patchProfile(
    @Req() request: ActiveIdentityRequest,
    @Body() body: unknown,
  ) {
    const { stageGateUserId } = request;

    return profileResponse(
      stageGateUserId,
      await this.profilesService.patch(stageGateUserId, body),
    );
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Header('Cache-Control', 'no-store')
  async deleteProfile(@Req() request: ActiveIdentityRequest): Promise<void> {
    await this.profilesService.delete(request.stageGateUserId);
  }
}
