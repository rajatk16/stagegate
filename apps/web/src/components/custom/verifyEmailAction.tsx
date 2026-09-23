import { useState } from "react";
import { Link } from "react-router";

import { getAuthUrl } from "@/lib";
import { useAuthAction } from "@/hooks";
import { verifyEmailCode } from "@/services";

import { Button } from "../ui";

type ActionProps = {
  code: string;
  returnTo: string;
}

export const VerifyEmailAction = ({ code, returnTo }: ActionProps) => {
  const [complete, setComplete] = useState(false);
  const { pending, error, run } = useAuthAction();

  const confirm = async () => {
    const result = await run(() => verifyEmailCode(code));

    if (result.ok) setComplete(true);
  }

  return (
    <div className="space-y-4">
      {complete ? (
        <>
          <p role="status">
            Your email is verified. Return to StageGate and check your verification status to continue.
          </p>

          <Button asChild>
            <Link to={getAuthUrl("/verify-email", returnTo)}>
              Return to StageGate
            </Link>
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Confirm your email address to complete verification.
          </p>

          <Button type="button" onClick={confirm} disabled={pending}>
            {pending ? "Verifying..." : "Verify email"}
          </Button>

          {error && (
            <div className="space-y-3">
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>

              <Link to={getAuthUrl("/verify-email", returnTo)} className="text-sm text-primary underline">
                Request another verification email
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
