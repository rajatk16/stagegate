import { User } from "firebase/auth";
import { createContext } from "react";

export type AuthSession = {
  status: "loading";
  user: null
} | {
  status: "authenticated";
  user: User;
} | {
  status: "unauthenticated";
  user: null;
};

export const AuthContext = createContext<AuthSession | undefined>(undefined);