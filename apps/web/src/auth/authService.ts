import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

import { auth } from '@/firebase/firebase';

import { useAuthStore } from './authStore';

const provider = new GoogleAuthProvider();

export const loginWIthGoogle = async () => {
  await signInWithPopup(auth, provider);
};

export const logOut = async () => {
  await signOut(auth);

  useAuthStore.getState().logout();
};
