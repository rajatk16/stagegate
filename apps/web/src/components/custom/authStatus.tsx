import { UserRound } from "lucide-react";

import { useAuth } from "@/hooks"

import { Badge } from "../ui";

export const AuthStatus = () => {
  const session = useAuth();

  const label = session.status === "loading" 
    ? "Restoring session" 
    : session.status === 'authenticated'
      ? session.user.email ?? "Signed in"
      : "Signed out";

  return (
    <Badge
      variant="outline"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="max-w-56 gap-2 py-2"
    >
      <UserRound className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate" title={label}>
        {label}
      </span>
    </Badge>
  );
}
