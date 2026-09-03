export type AuthenticationDenialReason =
  | 'crendentials_missing'
  | 'crendentials_malformed'
  | 'token_invalid'
  | 'token_expired'
  | 'token_revoked'
  | 'token_user_missing'
  | 'user_disabled'
  | 'email_unverified'
  | 'verification_unavailable';
