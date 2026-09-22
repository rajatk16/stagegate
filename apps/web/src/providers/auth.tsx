import { onAuthStateChanged } from "firebase/auth";
import { PropsWithChildren, useEffect, useState } from "react";

import { firebaseAuth } from "@/lib";
import { AuthSession, AuthContext } from "@/context";

export const AuthProvider = (props: PropsWithChildren) => {
  const [session, setSession] = useState<AuthSession>({
    status: "loading",
    user: null
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        setSession({
          status: 'authenticated',
          user
        });
      } else {
        setSession({
          status: 'unauthenticated',
          user: null
        });
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={session}>
      {props.children}
    </AuthContext.Provider>
  )
}
