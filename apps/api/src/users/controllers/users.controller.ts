import { type DecodedIdToken } from "firebase-admin/auth";
import { Body, Controller, Get, Header, Patch } from "@nestjs/common";

import { UsersService } from "../services";
import { toMeResponseDto } from "../mappers";
import { CurrentUser } from "../../auth/decorators";
import { MeResponseDto, UpdateProfileDto } from "../dtos";

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  @Header('Cache-Control', 'no-store')
  async getMe(@CurrentUser() user: DecodedIdToken): Promise<MeResponseDto> {
    const profile = await this.users.getOrCreateProfile(user);

    return toMeResponseDto(profile, user);
  }

  @Patch('me')
  @Header('Cache-Control', 'no-store')
  async updateMe(
    @CurrentUser() user: DecodedIdToken,
    @Body() dto: UpdateProfileDto
  ): Promise<MeResponseDto> {
    const profile = await this.users.updateProfile(user, dto);

    return toMeResponseDto(profile, user);
  }
}
