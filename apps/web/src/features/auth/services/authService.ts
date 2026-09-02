import {
  reload,
  signOut,
  type User,
  applyActionCode,
  confirmPasswordReset,
  sendEmailVerification,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

import { firebaseAuth } from '../../../lib';
import { routes } from '../../../app/routes';

export interface CreateAccountResult {
  readonly verificationEmailSent: boolean;
}

let verificationAction:
  | {
      readonly code: string;
      readonly promise: Promise<void>;
    }
  | undefined;

const getContinueUrl = () => new URL(routes.login, window.location.origin).toString();

const sendVerificationForUser = async (user: User): Promise<void> =>
  await sendEmailVerification(user, {
    url: getContinueUrl(),
  });

export const signInWithPassword = async (email: string, password: string): Promise<void> => {
  await signInWithEmailAndPassword(firebaseAuth, email, password);
};

export const createPasswordAccount = async (
  email: string,
  password: string,
): Promise<CreateAccountResult> => {
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);

  try {
    await sendVerificationForUser(credential.user);

    return {
      verificationEmailSent: true,
    };
  } catch {
    return {
      verificationEmailSent: false,
    };
  }
};

export const signOutCurrentUser = async (): Promise<void> => {
  await signOut(firebaseAuth);
};

export const resendVerificationEmail = async (): Promise<void> => {
  const user = firebaseAuth.currentUser;

  if (user === null) {
    throw new Error('A signed-in user is required.');
  }

  if (user.emailVerified) {
    return;
  }

  await sendVerificationForUser(user);
};

export const refreshEmailVerification = async (): Promise<boolean> => {
  const user = firebaseAuth.currentUser;

  if (user === null) {
    return false;
  }

  if (user.emailVerified) {
    await user.getIdToken(true);
  }

  return user.emailVerified;
};

export const completeEmailVerification = async (actionCode: string): Promise<void> => {
  if (verificationAction?.code === actionCode) {
    return verificationAction.promise;
  }

  const promise = applyActionCode(firebaseAuth, actionCode).then(async () => {
    const user = firebaseAuth.currentUser;

    if (user !== null) {
      await reload(user);
      await user.getIdToken(true);
    }
  });

  verificationAction = {
    code: actionCode,
    promise,
  };

  return promise;
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(firebaseAuth, email, {
    url: getContinueUrl(),
  });
};

export const inspectPasswordResetCode = async (actionCode: string): Promise<string> =>
  verifyPasswordResetCode(firebaseAuth, actionCode);

export const completePasswordReset = async (
  actionCode: string,
  newPassword: string,
): Promise<void> => {
  await confirmPasswordReset(firebaseAuth, actionCode, newPassword);
};
