import { useContext } from "react";

import { AuthContext, AuthSession } from "@/context";

export const useAuth = (): AuthSession => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
