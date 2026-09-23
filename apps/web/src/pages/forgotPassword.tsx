import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router"

import { useAuthAction } from "@/hooks";
import { AuthField } from "@/components/custom";
import { requestPasswordReset } from "@/services";
import { getAuthUrl, getSafeReturnTo } from "@/lib";
import { Button, Card, CardContent, CardHeader } from "@/components/ui";

export const ForgotPassword = () => {
  const [params] = useSearchParams();
  
  const returnTo = getSafeReturnTo(params.get("returnTo"));

  const [sent, setSent] = useState(false);
  const { pending, error, run, clearError } = useAuthAction();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<{ email: string }>({
    defaultValues: { email: "" }
  });

  const busy = pending || isSubmitting;

  const submit = async (values: { email: string }) => {
    const result = await run(() => requestPasswordReset(values.email, returnTo));

    if (result.ok) setSent(true);
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <h1 className="text-2xl font-semibold">
          Reset your password
        </h1>
      </CardHeader>

      <CardContent className="space-y-5">
        {sent ? (
          <p role="status" className="text-sm">
            If an account exists for that email, a password reset link has been requested. Check your inbox.
          </p>
        ) : (
          <form noValidate onSubmit={handleSubmit(submit)} onChange={clearError} aria-busy={busy} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter your email to receive a password reset link.
            </p>

            <fieldset disabled={busy} className="space-y-4">
              <legend className="sr-only">Reset email</legend>

              <AuthField 
                required 
                type="email" 
                id="reset-email" 
                label="Email address" 
                autoComplete="email" 
                error={errors.email?.message} 
                {...register("email", {
                  required: "Enter your email address",
                  validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) 
                    || "Enter a valid email address."
                })} 
              />

              <Button type="submit" disabled={busy}>
                {busy ? "Sending..." : "Send reset link"}
              </Button>
            </fieldset>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </form>
        )}

        <Link 
          to={getAuthUrl("/sign-in", returnTo)}
          className="text-sm text-primary underline"
        >
          Back to sign in
        </Link>
      </CardContent>
    </Card>
  );
}
