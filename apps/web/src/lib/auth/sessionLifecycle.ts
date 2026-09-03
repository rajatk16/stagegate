import { signOut } from 'firebase/auth';
import type { SessionEndReason } from './authContext';
import { firebaseAuth } from '../firebaseClient';

let requestedEndReason: SessionEndReason | undefined;

const requestSessionEnd = (reason: SessionEndReason) => {
  requestedEndReason = reason;
};

export const consumeSessionEndReason = (): SessionEndReason | undefined => {
  const reason = requestedEndReason;
  requestedEndReason = undefined;

  return reason;
};

const endSession = async (reason: SessionEndReason) => {
  requestSessionEnd(reason);

  try {
    await signOut(firebaseAuth);
  } catch (error: unknown) {
    if (requestedEndReason === reason) {
      requestedEndReason = undefined;
    }

    throw error;
  }
};

export const signOutSession = async () => {
  await endSession('signed-out');
};

export const expireAuthSession = async () => {
  await endSession('expired');
};

export const getAuthIdToken = async () => {
  const user = firebaseAuth.currentUser;

  if (user === null) {
    await expireAuthSession();
    throw new Error('An authenticated session is required.');
  }

  try {
    return await user.getIdToken();
  } catch (error: unknown) {
    await expireAuthSession();
    throw error;
  }
};
