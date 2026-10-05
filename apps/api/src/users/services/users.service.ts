import { DecodedIdToken } from 'firebase-admin/auth';
import { HttpStatus, Injectable } from '@nestjs/common';

import { UserProfile } from '../models';
import { UpdateProfileDto } from '../dtos';
import { ApiException } from '../../common';
import { UsersRepository } from '../repositories';
import { FirebaseService } from '../../firebase/services';
import { toNewUserProfile, toUserProfileChanges } from '../mappers';

type UserIdentitySummary = {
  displayName: string | null;
  email: string | null;
};

const normalizeIdentityText = (
  value: string | null | undefined,
): string | null => value?.trim() || null;

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly firebaseService: FirebaseService,
  ) {}

  async getOrCreateProfile(user: DecodedIdToken): Promise<UserProfile> {
    const candidate = toNewUserProfile(user, new Date());

    return this.usersRepository.getOrCreate(candidate);
  }

  updateProfile(
    user: DecodedIdToken,
    dto: UpdateProfileDto,
  ): Promise<UserProfile> {
    const changes = toUserProfileChanges(dto);

    if (Object.keys(changes).length === 0) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'PROFILE_UPDATE_EMPTY',
        'Provide at least one profile field to update.',
      );
    }

    const candidate = toNewUserProfile(user, new Date());

    return this.usersRepository.updateProfile(candidate, changes);
  }

  async getIdentitySummaries(
    uids: readonly string[],
  ): Promise<Map<string, UserIdentitySummary>> {
    const uniqueUids = [...new Set(uids)];
    const summaries = new Map<string, UserIdentitySummary>();

    for (let offset = 0; offset < uniqueUids.length; offset += 100) {
      const batch = uniqueUids.slice(offset, offset + 100);

      const [profiles, authResult] = await Promise.all([
        this.usersRepository.findByUids(batch),
        this.firebaseService.auth.getUsers(batch.map((uid) => ({ uid }))),
      ]);

      const profilesByUid = new Map(
        profiles.map((profile) => [profile.uid, profile]),
      );

      const authUsersByUid = new Map(
        authResult.users.map((user) => [user.uid, user]),
      );

      for (const uid of batch) {
        const profile = profilesByUid.get(uid);
        const authUser = authUsersByUid.get(uid);

        summaries.set(uid, {
          displayName: normalizeIdentityText(
            profile !== undefined ? profile.displayName : authUser?.displayName,
          ),
          email: normalizeIdentityText(authUser?.email),
        });
      }
    }

    return summaries;
  }
}
