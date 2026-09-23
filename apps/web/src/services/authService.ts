import { 
  reload,
  getIdToken,
  setPersistence, 
  applyActionCode,
  checkActionCode,
  confirmPasswordReset, 
  sendEmailVerification,
  sendPasswordResetEmail,
  browserLocalPersistence,
  verifyPasswordResetCode,
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";

import { firebaseAuth, getAuthUrl } from "@/lib";

export const registerAccount = async (email: string, password: string) => {
  await setPersistence(firebaseAuth, browserLocalPersistence);
  
  return createUserWithEmailAndPassword(
    firebaseAuth,
    email.trim(), 
    password
  );
}

export const signIn = async (email: string, password: string) => {
  await setPersistence(firebaseAuth, browserLocalPersistence);

  return signInWithEmailAndPassword(
    firebaseAuth, 
    email.trim(), 
    password
  );
}

export const signOut = () => firebaseSignOut(firebaseAuth);

export const emailActionSettings = (returnTo: string) => ({
  url: new URL(
    getAuthUrl("/sign-in", returnTo),
    window.location.origin,
  ).toString(),
  handleCodeInApp: false
});

export const sendVerification = async (returnTo: string) => {
  const user = firebaseAuth.currentUser;

  if (!user) {
    throw new FirebaseError("auth/requires-recent-login", "A signed-in user is required.");
  }

  await sendEmailVerification(user, emailActionSettings(returnTo));
}

export const refreshVerification = async (): Promise<boolean> => {
  const user = firebaseAuth.currentUser;

  if (!user) {
    throw new FirebaseError(
      "auth/requires-recent-login",
      "A signed-in user is required."
    );
  }

  await reload(user);

  await getIdToken(user, true);

  if (firebaseAuth.currentUser !== user) {
    throw new FirebaseError(
      "auth/requires-recent-login",
      "The active session changed."
    );
  }

  return user.emailVerified;
}

export const requestPasswordReset = async (email: string, returnTo: string) => {
  try {
    await sendPasswordResetEmail(firebaseAuth, email.trim(), emailActionSettings(returnTo));
  } catch (error: unknown) {
    if (error instanceof FirebaseError && error.code === "auth/user-not-found") {
      return;
    }

    throw error;
  }
} 

export const verifyEmailCode = async (code: string) => {
  const action = await checkActionCode(firebaseAuth, code);

  if (action.operation !== "VERIFY_EMAIL") {
    throw new FirebaseError(
      "auth/invalid-action-code",
      "Expected an email verification link."
    );
  }

  await applyActionCode(firebaseAuth, code);
}

export const checkPasswordResetCode = (code: string) => verifyPasswordResetCode(firebaseAuth, code);

export const resetPassword = (code: string, newPassword: string) => confirmPasswordReset(firebaseAuth, code, newPassword);
