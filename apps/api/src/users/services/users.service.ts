import { DecodedIdToken } from "firebase-admin/auth";
import { HttpStatus, Injectable } from "@nestjs/common";

import { UserProfile } from "../models";
import { UpdateProfileDto } from "../dtos";
import { ApiException } from "../../common";
import { UsersRepository } from "../repositories";
import { toNewUserProfile, toUserProfileChanges } from "../mappers";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getOrCreateProfile(user: DecodedIdToken): Promise<UserProfile> {
    const candidate = toNewUserProfile(user, new Date());

    return this.usersRepository.getOrCreate(candidate);
  }

  updateProfile(
    user: DecodedIdToken,
    dto: UpdateProfileDto
  ): Promise<UserProfile> {
    const changes = toUserProfileChanges(dto);

    if (Object.keys(changes).length === 0) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'PROFILE_UPDATE_EMPTY',
        'Provide at least one profile field to update.'
      );
    }

    const candidate = toNewUserProfile(user, new Date());

    return this.usersRepository.updateProfile(candidate, changes);
  }
}
