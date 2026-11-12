import { HttpStatus, Injectable } from '@nestjs/common';

import {
  IDENTITY_ERROR_CODES,
  updateUpserProfileRequestSchema,
} from '@stagegate/contracts';

import { IdentityError } from '../../identity/errors/identity.error';
import { ProfilesRepository } from '../repositories/profiles.repository';

@Injectable()
export class ProfilesService {
  constructor(private readonly profilesRepository: ProfilesRepository) {}

  async find(userId: string) {
    return this.profilesRepository.find(userId);
  }

  async patch(userId: string, body: unknown) {
    const input = updateUpserProfileRequestSchema.safeParse(body);
    if (!input.success) {
      throw new IdentityError(
        HttpStatus.BAD_REQUEST,
        IDENTITY_ERROR_CODES.INVALID_REQUEST,
        'Provide valid profile fields to update.',
      );
    }

    return this.profilesRepository.patch(userId, input.data);
  }

  async delete(userId: string) {
    return this.profilesRepository.delete(userId);
  }
}
