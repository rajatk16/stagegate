import { useForm } from 'react-hook-form';
import { LoaderCircle } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router";

import { useAuth } from "@/hooks";
import { registerAccount, signIn } from "@/services";
import { getAuthErrorMessage, getAuthUrl, getSafeReturnTo } from "@/lib";

import { AuthField } from "./authField";
import { Button, Card, CardContent, CardDescription, CardHeader } from "../ui";

type AuthFormProps = {
  mode: "register" | "sign-in";
}

type FormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

export const AuthForm = ({ mode }: AuthFormProps) => {
  const session = useAuth();
  const submissionLock = useRef(false);
  const [searchParams] = useSearchParams();
  const returnTo = getSafeReturnTo(searchParams.get('returnTo'));
  const [awaitingSession, setAwaitingSession] = useState(false);

  const isRegistration = mode === 'register';

  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const pending = isSubmitting || awaitingSession;

  const submit = async (values: FormValues) => {
    clearErrors("root");

    try {
      if (isRegistration) {
        await registerAccount(values.email, values.password);
      } else {
        await signIn(values.email, values.password)
      }

      setAwaitingSession(true);
    } catch (error: unknown) {
      setError("root.server", {
        type: "server",
        message: getAuthErrorMessage(error)
      });
    }
  }

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submissionLock.current || pending) return;

    submissionLock.current = true;

    try {
      await handleSubmit(submit)(event);
    } finally {
      submissionLock.current = false;
    }
  }

  if (session.status === "authenticated") {
    return (
      <Navigate 
        to={
          session.user.emailVerified 
            ? returnTo
            : getAuthUrl("/verify-email", returnTo)
        } 
        replace 
      />
    );

    return <Navigate to={returnTo} replace />;
  }

  const title = isRegistration ? "Create your account" : "Welcome back";

  const actionLabel = isRegistration ? "Create account" : "Sign in";

  const pendingLabel = awaitingSession
    ? "Opening your workspace..."
    : isRegistration
      ? "Creating account..."
      : "Signing in...";

  return (
    <Card className="mx-auto w-full max-w-md shadow-sm">
      <CardHeader className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {title}
        </h1>

        <CardDescription>
          {isRegistration 
            ? "Start your next stage with a StageGate account."
            : "Sign in to continue to your StageGate workspace."
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          noValidate
          onSubmit={handleFormSubmit}
          onChange={() => clearErrors("root")}
          aria-busy={pending}
          className="space-y-5"
        >
          {errors.root?.server?.message && (
            <div
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {errors.root.server.message}
            </div>
          )}

          <fieldset disabled={pending} className="space-y-5">
            <legend className="sr-only">{title}</legend>

            <AuthField 
              id="auth-email"
              label="Email address"
              type="email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email", {
                required: "Enter your email address.",
                validate: (value) =>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || "Enter a valid email address."
              })}
            />

            <AuthField 
              id="auth-password"
              label="Password"
              type="password"
              autoComplete={
                isRegistration ? "new-password" : "current-password"
              }
              required
              hint={
                isRegistration ? "Use at least 6 characters." : undefined
              }
              error={errors.password?.message}
              {...register("password", {
                required: "Enter your password.",
                validate: (value) => !isRegistration || value.length >= 6 || "Use at least 6 characters.",
                deps: isRegistration ? ["confirmPassword"] : [],
              })}
            />

            {isRegistration && (
              <AuthField
                id="auth-confirm-password"
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                required
                error={errors.confirmPassword?.message}
                {...register("confirmPassword", {
                  required: "Confirm your password.",
                  validate: (value, values) =>
                    value === values.password ||
                    "The passwords do not match.",
                })}
              />
            )}

            {!isRegistration && !pending && (
              <Link
                to={getAuthUrl("/forgot-password", returnTo)}
                className="block text-sm text-primary underline"
              >
                Forgot your password?
              </Link>
            )}

            <Button type="submit" disabled={pending} className="h-11 w-full">
              {pending && (
                <LoaderCircle 
                  className="size-4 motion-safe:animate-spin"
                  aria-hidden="true"
                />
              )}
              {pending ? pendingLabel : actionLabel}
            </Button>
          </fieldset>

          <p role="status" className="sr-only">
            {pending ? pendingLabel : ""}
          </p>

          <div className="text-center text-sm text-muted-foreground">
            {pending ? (
              <span>Please wait while we finish your request.</span>
            ) : (
              <>
                {isRegistration ? "Already have an account?" : "New to StageGate?"}

                <Link to={getAuthUrl(isRegistration ? '/sign-in' : '/register', returnTo)} className='font-medium text-primary underline underline-offset-4 hover:underline'>
                  {isRegistration ? "Sign in" : "Create an account"}
                </Link>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}