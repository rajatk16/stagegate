import { auth } from '@/firebase/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const provider = new GoogleAuthProvider();

export const loginWIthGoogle = async () => {
  await signInWithPopup(auth, provider);
};

export const logOut = async () => {
  await signOut(auth);
};
