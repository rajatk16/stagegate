import { type UserProfile } from './userProfile.types';

export interface BootstrapResult {
  created: boolean;
  profile: UserProfile;
}
