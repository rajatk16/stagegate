import { IdentityRequest } from './identityRequest.type';

export interface ActiveIdentityRequest extends IdentityRequest {
  stageGateUserId: string;
}
