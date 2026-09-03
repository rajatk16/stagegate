import { type AuthenticationDenialReason } from './authenticationDenialReson.types';

export interface AuthenticationDenial {
  requestId: string;
  target: string;
  actorId: string | null;
  reason: AuthenticationDenialReason;
}
