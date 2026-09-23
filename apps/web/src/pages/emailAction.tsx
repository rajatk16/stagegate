import { Link, useSearchParams } from "react-router";

import { getAuthUrl, getEmailReturnTo } from "@/lib";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { ResetPasswordAction, VerifyEmailAction } from "@/components/custom";

export function EmailAction() {
  const [params] = useSearchParams();

  const mode = params.get("mode");
  const code = params.get("oobCode") ?? "";
  const returnTo = getEmailReturnTo(params.get("continueUrl"));

  const supported =
    Boolean(code) &&
    (mode === "verifyEmail" || mode === "resetPassword");

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <h1 className="text-2xl font-semibold">
          {!supported
            ? "Invalid email link"
            : mode === "verifyEmail"
              ? "Confirm your email"
              : "Choose a new password"}
        </h1>
      </CardHeader>

      <CardContent>
        {!supported ? (
          <div className="space-y-4">
            <p role="alert">
              This link is incomplete or unsupported. Open the
              full link from your email.
            </p>

            <Link
              to={getAuthUrl("/sign-in", returnTo)}
              className="text-sm text-primary underline"
            >
              Back to sign in
            </Link>
          </div>
        ) : mode === "verifyEmail" ? (
          <VerifyEmailAction
            key={code}
            code={code}
            returnTo={returnTo}
          />
        ) : (
          <ResetPasswordAction
            key={code}
            code={code}
            returnTo={returnTo}
          />
        )}
      </CardContent>
    </Card>
  );
}
