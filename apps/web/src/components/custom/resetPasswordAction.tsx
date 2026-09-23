import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";

import { useAuthAction } from "@/hooks";
import { getAuthErrorMessage, getAuthUrl } from "@/lib";
import { checkPasswordResetCode, resetPassword } from "@/services";

import { Button } from "../ui";
import { AuthField } from "./authField";

type PasswordValues = {
  password: string;
  confirmPassword: string; 
}

type ActionProps = {
  code: string;
  returnTo: string;
}

export const ResetPasswordAction = ({ code, returnTo}: ActionProps) => {
  const [checking, setChecking] = useState(true);
  const [complete, setComplete] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const { pending, error, run ,clearError } = useAuthAction();

  const {
    register, 
    handleSubmit, 
    formState: { 
      errors, 
      isSubmitting 
    }
  } = useForm<PasswordValues>({
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  useEffect(() => {
    let active = true;

    void checkPasswordResetCode(code).then(
      () => {
        if (active) setChecking(false);
      },
      (error: unknown) => {
        if (active) {
          setLinkError(getAuthErrorMessage(error));
          setChecking(false);
        }
      }
    );

    return () => {
      active = false;
    }
  }, [code]);

  const submit = async (values: PasswordValues) => {
    const result = await run(() => resetPassword(code, values.password));

    if (result.ok) setComplete(true);
  }

  if (checking) {
    return <p role="status">Checking your reset link...</p>
  }

  if (linkError) {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-destructive">
          {linkError}
        </p>

        <Link 
          to={getAuthUrl("/forgot-password", returnTo)}
          className="text-sm text-primary underline"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  if (complete) {
    return (
      <div className="space-y-4">
        <p role="status">
          Your password has been reset. You can now sign in with your new password.
        </p>

        <Button asChild>
          <Link to={getAuthUrl("/sign-in", returnTo)}>
            Continue to sign in
          </Link>
        </Button>
      </div>
    );
  }

  const busy = pending || isSubmitting;

  return (
    <form
      noValidate
      onSubmit={handleSubmit(submit)}
      onChange={clearError}
      aria-busy={busy}
      className="space-y-4"
    >
      <fieldset disabled={busy} className="spae-y-4">
        <legend className="sr-only">New password</legend>

        <AuthField 
          id="new-password"
          label="New password"
          type="password"
          autoComplete="new-password"
          required
          hint="Use at least 6 characters"
          error={errors.password?.message}
          {...register("password", {
            required: "Enter a new password",
            minLength: {
              value: 6,
              message: "Use at least 6 characters."
            },
            deps: ["confirmPassword"]
          })}
        />

        <AuthField
          id="confirm-new-password"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          required
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required: "Confirm your new password.",
            validate: (value, values) =>
              value === values.password ||
              "The passwords do not match.",
          })}
        />

        <Button type="submit" disabled={busy}>
          {busy ? "Resetting password…" : "Reset password"}
        </Button>

        {error && (
          <div className="space-y-3">
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>

            <Link to={getAuthUrl("/forgot-password", returnTo)} className="text-sm text-primary underline">
              Request a new reset link
            </Link>
          </div>
        )}
      </fieldset>
    </form>
  )
}
