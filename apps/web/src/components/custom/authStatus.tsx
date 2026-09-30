import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { LoaderCircle, UserRound } from "lucide-react";

import { useAuth } from "@/hooks";
import { signOut } from "@/services";
import { getAuthErrorMessage } from "@/lib";

import { Button } from "../ui";

export const AuthStatus = () => {
  const session = useAuth();
  const navigate = useNavigate();

  const lock = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>();

  const handleSignOut = async () => {
    if (lock.current) return;

    lock.current = true;
    setPending(true);
    setError(null);

    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error: unknown) {
      setError(getAuthErrorMessage(error));
    } finally {
      lock.current = false;
      setPending(false);
    }
  };

  if (session.status !== "authenticated") {
    return null;
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/profile" className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm focus-visible:outline-2 focus-visible:outline-ring">
          <UserRound aria-hidden="true" className="size-4" />
          <span className="max-w-40 truncate">
            {session.user.email ?? "Your profile"}
          </span>
        </Link>

        <Button
          type="button"
          variant="ghost"
          className="min-h-11"
          disabled={pending}
          onClick={() => void handleSignOut()}
        >
          {pending && (
            <LoaderCircle
              className="size-4 motion-safe:animate-spin"
              aria-hidden="true"
            />
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
};
