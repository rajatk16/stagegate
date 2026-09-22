import { signInWithEmailAndPassword, signOut as firebaseSignOut, createUserWithEmailAndPassword } from "firebase/auth";

import { firebaseAuth } from "@/lib";

export const registerAccount = (email: string, password: string) => 
  createUserWithEmailAndPassword(
    firebaseAuth,
    email.trim(), 
    password
  );

export const signIn = (email: string, password: string) => 
  signInWithEmailAndPassword(
    firebaseAuth, 
    email, 
    password
  );

export const signOut = () => firebaseSignOut(firebaseAuth);
