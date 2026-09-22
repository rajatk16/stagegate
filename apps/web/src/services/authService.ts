import { signInWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth";

import { firebaseAuth } from "@/lib";

export const signIn = (email: string, password: string) => signInWithEmailAndPassword(firebaseAuth, email, password);

export const signOut = () => firebaseSignOut(firebaseAuth);
