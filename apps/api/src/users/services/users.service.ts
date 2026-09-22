import { Injectable } from "@nestjs/common";
import { DecodedIdToken } from "firebase-admin/auth";

import { UserProfile } from "../models";
import { toNewUserProfile } from "../mappers";
import { UsersRepository } from "../repositories";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getOrCreateProfile(user: DecodedIdToken): Promise<UserProfile> {
    const candidate = toNewUserProfile(user, new Date());

    return this.usersRepository.getOrCreate(candidate);
  }
}
