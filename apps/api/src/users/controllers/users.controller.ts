import { Controller, Get, Header } from "@nestjs/common";
import { type DecodedIdToken } from "firebase-admin/auth";

import { MeResponseDto } from "../dtos";
import { UsersService } from "../services";
import { toMeResponseDto } from "../mappers";
import { CurrentUser } from "../../auth/decorators";

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  @Header('Cache-Control', 'no-store')
  async getMe(@CurrentUser() user: DecodedIdToken): Promise<MeResponseDto> {
    const profile = await this.users.getOrCreateProfile(user);

    return toMeResponseDto(profile);
  }
}
