import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

import { auth } from '@/firebase/firebase';
import { bootstrapApp } from '@/bootstrap/api';

import { useAuthStore } from './authStore';

const provider = new GoogleAuthProvider();

export const loginWIthGoogle = async () => {
  await signInWithPopup(auth, provider);

  await bootstrapApp();
};

export const logOut = async () => {
  await signOut(auth);

  useAuthStore.getState().logout();
};
