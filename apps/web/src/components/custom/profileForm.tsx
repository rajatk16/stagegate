import { User } from "firebase/auth";
import { useForm } from "react-hook-form";
import { useEffect, useMemo, useRef, useState } from "react";

import { getProfileErrorMessage, Profile, updateProfile } from "@/services";

import { SubmitButton } from "./form";
import { InlineAlert } from "./alerts";
import { ConfirmDialog } from "./dialogs";
import { InputField, SelectField, TextareaField } from "./form";
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
    setFocus,
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
              <InputField
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

              <InputField
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

            <TextareaField
              id="profile-biography"
              label="Biography (optional)"
              hint="Up to 1,000 characters."
              error={errors.biography?.message}
              rows={5}
              placeholder="Tell us a little about yourself."
              {...register("biography", {
                validate: (value) =>
                  value.trim().length <= 1000 ||
                  "Use 1,000 characters or fewer.",
              })}
            />

            <div className="space-y-3">
              <SelectField
                id="profile-timezone"
                label="Timezone"
                required
                hint="Choose the timezone you want associated with your profile."
                error={errors.timezone?.message}
                {...register("timezone", {
                  required: "Choose your timezone.",
                  validate: (value) =>
                    timezones.includes(value) || "Choose a valid timezone.",
                })}
              >
                <option value="">Choose your timezone</option>

                {timezones.map((timezone) => (
                  <option key={timezone} value={timezone}>
                    {timezone.replaceAll("_", " ")}
                  </option>
                ))}
              </SelectField>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSaved(false);
                  setValue("timezone", deviceTimezone, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              >
                Use device timezone: {deviceTimezone}
              </Button>
            </div>

            <div className="flex flex-wrap gap-3 border-t pt-6">
              <SubmitButton
                pending={pending}
                pendingLabel="Saving…"
                disabled={!isDirty}
              >
                Save changes
              </SubmitButton>

              <ConfirmDialog
                triggerLabel="Discard changes"
                title="Discard your changes?"
                description="Your edits will be replaced with the last saved profile values."
                confirmLabel="Discard changes"
                cancelLabel="Keep editing"
                destructive
                disabled={pending || !isDirty}
                onConfirm={() => {
                  reset();
                  setSaved(false);
                }}
                restoreFocus={() => setFocus("displayName")}
              />
            </div>
          </fieldset>

          {errors.root?.server?.message && (
            <InlineAlert tone="error" title="Profile was not saved">
              {errors.root.server.message}
            </InlineAlert>
          )}

          <div role="status" aria-live="polite" className="text-sm text-muted-foreground">
            {pending
              ? "Saving your profile…"
              : isDirty
                ? "You have unsaved changes."
                : ""}
          </div>

          {saved && !isDirty && !pending && (
            <InlineAlert tone="success" title="Profile saved">
              Your changes have been saved.
            </InlineAlert>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
