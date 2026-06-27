import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

import { auth } from '@/firebase';

import { useAuthStore } from './store';

const provider = new GoogleAuthProvider();

export const loginWIthGoogle = async () => {
  await signInWithPopup(auth, provider);
};

export const logOut = async () => {
  await signOut(auth);

  useAuthStore.getState().logout();
};
