import { AuthException } from "../../common";

export const getFirebaseErrorCode = (error: unknown): string | undefined => {
  if (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string') {
    return error.code;
  }

  return undefined;
}


export const toAuthException = (error: unknown): AuthException => {
  switch (getFirebaseErrorCode(error)) {
    case 'auth/id-token-expired':
      return new AuthException('AUTH_TOKEN_EXPIRED');

    case 'auth/id-token-revoked':
      return new AuthException('AUTH_TOKEN_REVOKED');

    case 'auth/user-disabled':
      return new AuthException('AUTH_USER_DISABLED');

    case 'auth/argument-error':
    case 'auth/invalid-argument':
    case 'auth/invalid-id-token':
    case 'auth/user-not-found':
      return new AuthException('AUTH_INVALID_TOKEN');

    default:
      return new AuthException('AUTH_UNAVAILABLE');
  }
}
