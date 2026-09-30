import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

import { useAuth } from "@/hooks"
import { getAuthUrl } from "@/lib";

import { Button } from "../ui";

export const PublicAuthActions = ({
  includeSignIn = true
}: {
  includeSignIn?: boolean
}) => {
  const session = useAuth();

  if (session.status === 'loading') {
    return (
      <span role="status" className="inline-flex min-h11 items-center text-sm text-muted-foreground">
        Restoring session...
      </span>
    );
  }

  if (session.status === 'authenticated') {
    return (
      <Button asChild className="min-h-11 px-5">
        <Link to="/dashboard">
          Open Dashboard
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {includeSignIn && (
        <Button asChild variant="outline" className="min-h-11 px-5">
          <Link to={getAuthUrl("/sign-in", "/dashboard")}>
            Sign in
          </Link>
        </Button>
      )}

      <Button asChild className="min-h-11 px-5">
        <Link to={getAuthUrl("/register", "/dashboard")}>
          Create Account
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </Button>
    </div>
  )
}
