import { FirebaseError } from 'firebase/app';

export type AuthOperation =
  | 'login'
  | 'sign-up'
  | 'logout'
  | 'send-verification'
  | 'verify-email'
  | 'request-password-reset'
  | 'reset-password';

const defaultMessages: Record<AuthOperation, string> = {
  login: 'We could not sign you in. Check your details and try again.',
  'sign-up': 'We could not create your account. Please try again.',
  logout: 'We could not sign you out. Please try again.',
  'send-verification': 'We could not send the verification email. Please try again.',
  'verify-email': 'This verification link is invalid or has expired. Request a new email.',
  'request-password-reset': 'We could not process your request. Please try again.',
  'reset-password': 'We could not reset your password. Request a new reset link.',
};

const sharedMessages: Partial<Record<string, string>> = {
  'auth/netword-request-failed':
    'We could not reach the authentication service. Check your connection and try again.',
  'auth/too-many-requests': 'Too many attempts were made. Wait a moment and try again.',
  'auth/user-disabled': 'This account has been disabled. Contact support for assistance.',
  'auth/operation-not-allowed': 'This authentication method is temporarily unavailable.',
};

const operationMessages: Partial<Record<AuthOperation, Partial<Record<string, string>>>> = {
  login: {
    'auth/invalid-credential': 'The email address or password is incorrect.',
    'auth/invalid-login-credentials': 'The email address or password is incorrect.',
    'auth/wrong-password': 'The email address or password is incorrect.',
    'auth/user-not-found': 'The email address or password is incorrect.',
  },
  'sign-up': {
    'auth/email-already-in-use':
      'An account could not be created with those details. Try signing in instead.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/weak-password': 'Choose a stronger password and try again.',
  },
  'verify-email': {
    'auth/expired-action-code': 'This verification link has expired. Request a new email.',
    'auth/invalid-action-code': 'This verification link is invalid or has already been used.',
  },
  'reset-password': {
    'auth/expired-action-code': 'This password-reset link has expired. Request a new one.',
    'auth/invalid-action-code': 'This password-reset link is invalid or has already been used.',
    'auth/weak-password': 'Choose a stronger password and try again.',
  },
};

export const getAuthErrorMessage = (error: unknown, operation: AuthOperation) => {
  if (!(error instanceof FirebaseError)) {
    return defaultMessages[operation];
  }

  return (
    operationMessages[operation]?.[error.code] ??
    sharedMessages[error.code] ??
    defaultMessages[operation]
  );
};
