import { 
  setPersistence, 
  browserLocalPersistence,
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  createUserWithEmailAndPassword, 
} from "firebase/auth";

import { firebaseAuth } from "@/lib";

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
