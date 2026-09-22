import { Link } from "react-router";
import { useRef, useState } from "react";
import { LoaderCircle, UserRound } from "lucide-react";

import { useAuth } from "@/hooks"
import { signOut } from "@/services";
import { getAuthErrorMessage } from "@/lib";

import { Badge, Button } from "../ui";

export const AuthStatus = () => {
  const session = useAuth();
  const signOutLock = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    if (signOutLock.current) return;

    signOutLock.current = true;
    setPending(true);
    setError(null);

    try {
      await signOut();
    } catch (error: unknown) {
      setError(getAuthErrorMessage(error));
    } finally {
      signOutLock.current = false;
      setPending(false);
    }
  }

  if (session.status === 'loading') {
    return <Badge variant="outline">Restoring session...</Badge>
  }

  if (session.status === 'unauthenticated') {
    return (
      <Button asChild variant="outline">
        <Link to="/sign-in">Sign in</Link>
      </Button>
    );
  }

  const label = session.user.email ?? "Signed in";

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" role="status" className="max-w-48 gap-2 py-2">
          <UserRound  className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate" title={label}>
            {label}
          </span>
        </Badge>

        <Button type="button" variant="ghost" disabled={pending} onClick={handleSignOut}>
          {pending && (
            <LoaderCircle className="size-4 motion-safe:animate-spin" aria-hidden="true" />
          )}

          {pending ? "Signing out..." : "Sign out"}
        </Button>
      </div>

      {error && (
        <p className="max-w-xs text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
