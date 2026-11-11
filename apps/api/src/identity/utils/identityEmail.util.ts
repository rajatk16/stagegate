import { stagegateHmac } from '../../common/crypto/stagegateHmac.crypto';

export const normalizeIdentityEmail = (email: string): string =>
  email.trim().toLowerCase();

export const identityEmailKey = (email: string): string =>
  stagegateHmac('stagegate.identity.email.v1', normalizeIdentityEmail(email));
