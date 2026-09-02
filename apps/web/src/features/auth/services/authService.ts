import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

import { firebaseAuth } from '../../../lib';

export const signInWithPassword = async (email: string, password: string): Promise<void> => {
  await signInWithEmailAndPassword(firebaseAuth, email, password);
};

export const createPasswordAccount = async (email: string, password: string): Promise<void> => {
  await createUserWithEmailAndPassword(firebaseAuth, email, password);
};

export const signOutCurrentUser = async (): Promise<void> => {
  await signOut(firebaseAuth);
};
