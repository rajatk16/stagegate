import { Injectable } from '@nestjs/common';

import { IdentityError } from '../utils';
import { AuthenticatedUser } from '../../auth';
import { UserProfileRepository } from '../repositories';
import { ProfilePatch, UserProfile } from '../types';

export interface ProfileResponse {
  userId: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  bio: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class IdentityService {
  constructor(private readonly identityRepository: UserProfileRepository) {}

  async bootstrap(
    actor: AuthenticatedUser,
    requestId: string,
  ): Promise<{ created: boolean; profile: ProfileResponse }> {
    const result = await this.identityRepository.bootstrap(actor.uid, requestId);

    return {
      created: result.created,
      profile: this.toResponse(result.profile, actor),
    };
  }

  async getProfile(actor: AuthenticatedUser): Promise<ProfileResponse> {
    const profile = await this.identityRepository.find(actor.uid);

    if (profile === null) {
      throw new IdentityError('USER_NOT_BOOTSTRAPPED');
    }

    return this.toResponse(profile, actor);
  }

  async updateProfile(
    actor: AuthenticatedUser,
    patch: ProfilePatch,
    requestId: string,
  ): Promise<ProfileResponse> {
    const profile = await this.identityRepository.update(actor.uid, patch, requestId);

    return this.toResponse(profile, actor);
  }

  private toResponse(profile: UserProfile, actor: AuthenticatedUser): ProfileResponse {
    return {
      userId: profile.userId,
      email: actor.email,
      emailVerified: actor.emailVerified,
      displayName: profile.displayName,
      bio: profile.bio,
      version: profile.version,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }
}
