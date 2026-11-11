import { Request } from 'express';

import { VerifiedFirebaseIdentity } from './verifiedFirebaseIdentity.type';

export interface IdentityRequest extends Request {
  firebaseIdentity: VerifiedFirebaseIdentity;
}
