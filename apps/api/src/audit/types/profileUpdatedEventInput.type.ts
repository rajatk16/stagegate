import { PROFILE_FIELDS } from '../enums/profileFields.enum';

export interface ProfileUpdatedEventInput {
  actorUid: string;
  targetUid: string;
  requestId: string;
  fields: readonly PROFILE_FIELDS[];
}
