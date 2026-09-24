import { User } from "firebase/auth";
import { useForm } from "react-hook-form";
import { useEffect, useMemo, useRef, useState } from "react";

import { getProfileErrorMessage, Profile, updateProfile } from "@/services";

import { AuthField } from "./authField";
import { Button, Card, CardContent, CardDescription, CardHeader } from "../ui";

type ProfileFormValues = {
  displayName: string;
  biography: string;
  affiliation: string;
  timezone: string;
}

type ProfileFormProps = {
  user: User;
  profile: Profile
}

const toFormValues = (profile: Profile): ProfileFormValues => ({
  displayName: profile.displayName ?? "",
  biography: profile.biography ?? '',
  affiliation: profile.affiliation ?? '',
  timezone: profile.timezone ?? ''
});

const controlClassName = `
  w-full rounded-md border border-input bg-background px-3 py-2 
  text-sm text-foreground shadow-sm outline-none
  focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50
  aria-invalid:border-destructive disabled:cursor-not-allowed
  disabled:opacity-50
`;

export const ProfileForm = ({ user, profile }: ProfileFormProps) => {
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const requestRef = useRef<AbortController | null>(null);

  const deviceTimezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    []
  );

  const timezones = useMemo(
    () => Array.from(
      new Set([
        "UTC",
        deviceTimezone,
        ...(profile.timezone ? [profile.timezone] : []),
        ...Intl.supportedValuesOf("timeZone")
      ]),
    ).sort(),
    [deviceTimezone, profile.timezone]
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isDirty }
  } = useForm<ProfileFormValues>({
    defaultValues: toFormValues(profile),
    mode: 'onBlur'
  });

  useEffect(() => {
    return () => {
      requestRef.current?.abort();
    };
  }, []);

  const submit = handleSubmit(async (values) => {
    if (requestRef.current) return;

    const controller = new AbortController();
    requestRef.current = controller;

    setPending(true);
    setSaved(false);
    clearErrors("root");

    try {
      const updated = await updateProfile(
        user,
        {
          displayName: values.displayName.trim(),
          biography: values.biography.trim() || null,
          affiliation: values.affiliation.trim() || null,
          timezone: values.timezone
        },
        controller.signal
      );

      if (controller.signal.aborted) return;

      reset(toFormValues(updated));
      setSaved(true);
    } catch (error: unknown) {
      if (!controller.signal.aborted) {
        setError("root.server", {
          type: 'server',
          message: getProfileErrorMessage(error)
        })
      }
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
      }

      if (!controller.signal.aborted) {
        setPending(false);
      }
    }
  });

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <h1 className="text-2xl font-semibold tracking-tight">
          Your profile
        </h1>
        <CardDescription>
          Update how you appear in StageGate.
        </CardDescription>
        <p className="break-all text-sm text-muted-foreground">
          Signed in as {user.email ?? "your account"}
        </p>
      </CardHeader>

      <CardContent>
        <form
          noValidate
          onSubmit={submit}
          aria-busy={pending}
          className="space-y-6"
        >
          <fieldset
            disabled={pending}
            className="min-w-0 space-y-6 border-0 p-0"
          >
            <legend
              className="sr-only"
            >
              Profile details
            </legend>

            <div className="grid gap-6 sm:grid-cols-2">
              <AuthField
                id="profile-name"
                label="Name"
                autoComplete="name"
                required
                error={errors.displayName?.message}
                hint="Up to 80 characters."
                {...register("displayName", {
                  validate: (value) => {
                    const name = value.trim();

                    if (!name) return "Enter your name.";
                    if (name.length > 80) {
                      return "Use 80 characters or fewer."
                    }

                    return true;
                  }
                })}
              />

              <AuthField 
                id="profile-affiliation"
                label="Affiliation (optional)"
                autoComplete="organization"
                placeholder="Company, university, or organization"
                error={errors.affiliation?.message}
                hint={"Up to 120 characters."}
                {...register("affiliation", {
                  validate: (value) => value.trim().length <= 120 || "Use 120 characters or fewer."
                })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="profile-biography" className="text-sm font-medium">
                Biography (optional)
              </label>

              <textarea 
                id="profile-biography"
                rows={5}
                className={`${controlClassName} min-h-32 resize-y`}
                placeholder="Tell us a little about yourself."
                aria-invalid={Boolean(errors.biography)}
                aria-describedby={
                  errors.biography 
                    ? "biography-hint biography-error" 
                    : "biography-hint"
                }
                {...register("biography", {
                  validate: (value) => 
                    value.trim().length <= 1000 || 
                  "Use 1,000 characters or fewer."
                })}
              />

              <p
                id="biography-hint"
                className="text-xs text-muted-foreground"
              >
                Up to 1,000 characters.
              </p>

              {errors.biography && (
                <p
                  id="biography-error" 
                  role="alert" 
                  className="text-sm text-destructive"
                >
                  {errors.biography.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label 
                htmlFor="profile-timezone" 
                className="text-sm font-medium"
              >
                Timezone
              </label>
              <select
                id="profile-timezone"
                required
                className={`${controlClassName} h-11`}
                aria-invalid={Boolean(errors.timezone)}
                aria-describedby={
                  errors.timezone 
                    ? "timezone-hint timezone-error" 
                    : "timezone-hint"
                }
                {...register("timezone", {
                  required: "Choose your timezone.",
                  validate: (value) => timezones.includes(value) || "Choose a valid timezone."
                })}
              >
                <option value="">Choose your timezone</option>
                {timezones.map((timezone) => (
                  <option key={timezone} value={timezone}>
                    {timezone.replaceAll("_", " ")}
                  </option>
                ))}
              </select>

              <p id="timezone-hint" className="text-xs text-muted-foreground">
                Choose the timezone you want associated with your profile.
              </p>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSaved(false);
                  setValue("timezone", deviceTimezone, {
                    shouldDirty: true,
                    shouldValidate: true
                  });
                }}
              >
                Use device timezone: {deviceTimezone}
              </Button>

              {errors.timezone && (
                <p 
                  role="alert" 
                  id="timezone-error"
                  className="text-sm text-destructive"
                >
                  {errors.timezone.message}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 border-t pt-6">
              <Button type="submit" disabled={pending || !isDirty}>
                {pending ? "Saving..." : "Save changes"}
              </Button>

              <Button 
                type="button" 
                variant="outline" 
                disabled={pending || !isDirty} 
                onClick={() => {
                  reset();
                  setSaved(false)
                }}
              >
                Discard changes
              </Button>
            </div>
          </fieldset>

          {errors.root?.server?.message && (
            <p role="alert" className="text-sm text-destructive">
              {errors.root.server.message}
            </p>
          )}

          <p
            role="status"
            aria-live="polite"
            className="min-h-5 text-sm text-muted-foreground"
          >
            {
              pending
                ? "Saving your profile..."
                : isDirty
                  ? "You have unsaved changes."
                  : saved
                    ? "Profile saved."
                    : ""
            }
          </p>
        </form>
      </CardContent>
    </Card>
  )
}