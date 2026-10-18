import { AuthException } from '../../common/exceptions';
import { RECENT_AUTHENTICATION_SECONDS } from '../constants';

export const assertRecentAuthentication = (authTime: unknown): void => {
  const now = Math.floor(Date.now() / 1000);

  if (
    typeof authTime !== 'number' ||
    !Number.isSafeInteger(authTime) ||
    authTime <= 0 ||
    authTime > now ||
    now - authTime >= RECENT_AUTHENTICATION_SECONDS
  ) {
    throw new AuthException('AUTH_RECENT_LOGIN_REQUIRED');
  }
};
