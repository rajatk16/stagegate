import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router";

import { useAuth, useAuthAction } from "@/hooks"
import { getAuthUrl, getSafeReturnTo } from "@/lib";
import { refreshVerification, sendVerification } from "@/services";
import { Button, Card, CardContent, CardHeader } from "@/components/ui";

export const VerifyEmail = () => {
  const session = useAuth();
  
  const [params] = useSearchParams();
  
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);
  
  const { pending, error, run } = useAuthAction();
  
  const returnTo = getSafeReturnTo(params.get("returnTo"));

  useEffect(() => {
    if (cooldown === 0) return;

    const timer = window.setTimeout(() => setCooldown((seconds) => Math.max(0, seconds - 1)), 1_000);

    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const handleSend = async () => {
    if (cooldown > 0) return;

    setMessage("");

    const result = await run(() => sendVerification(returnTo));

    if (result.ok) {
      setSent(true);
      setCooldown(60);
      setMessage("Verification email requested. Open its link, then check your status here.")
    }
  }

  const handleCheck = async () => {
    setMessage("");
    
    const result = await run(refreshVerification);

    if (result.ok && !result.value) {
      setMessage(
        "Your email is not verified yet. Open the verification link and try again."
      );
    }
  }

  if (session.status === "loading") return null;

  if (session.status === "unauthenticated") {
    return (
      <Navigate to={getAuthUrl("/sign-in", returnTo)} replace />
    );
  }

  if (session.user.emailVerified) {
    return <Navigate to={returnTo} replace />;
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <h1 className="text-2xl font-semibold">
          Verify your email
        </h1>
      </CardHeader>

      <CardContent className="space-y-5">
        <p className="text-sm text-muted-foreground">
          Verify <strong>{session.user.email}</strong> to continue to your workspace.
        </p>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <p role="status" className="text-sm">
          {pending ? "Working..." : message}
        </p>

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            onClick={handleSend}
            disabled={pending || cooldown > 0}
          >
            {cooldown > 0 
              ? `Resend available in ${cooldown}s` 
              : sent
                ? "Resend verification email"
                : "Send verification email"
            }
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleCheck}
            disabled={pending}
          >
            I've verified my email
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}