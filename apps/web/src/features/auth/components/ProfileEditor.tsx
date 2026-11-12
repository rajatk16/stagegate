import z from 'zod';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useFieldArray, useForm } from 'react-hook-form';

import {
  type UserProfileFields,
  userProfileFieldsSchema,
  type UserProfileResponse,
  updateUpserProfileRequestSchema,
} from '@stagegate/contracts';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/form/FormFields';
import {
  InputGroupInput,
  InputGroupTextarea,
} from '@/components/ui/inputGroup';

import { useAuth } from '../context/auth';
import { userProfileKey } from '../hooks/useUserProfile';

const blankToNull = (schema: z.ZodType<string | null, string | null>) =>
  z
    .string()
    .transform((value) => value.trim() || null)
    .pipe(schema);

const formSchema = userProfileFieldsSchema.extend({
  displayName: z
    .string()
    .trim()
    .min(1, 'Enter your name')
    .pipe(userProfileFieldsSchema.shape.displayName.unwrap()),
  bio: blankToNull(userProfileFieldsSchema.shape.bio),
  location: blankToNull(userProfileFieldsSchema.shape.location),
  occupation: blankToNull(userProfileFieldsSchema.shape.occupation),
  contactEmail: blankToNull(userProfileFieldsSchema.shape.contactEmail),
  contactPhone: blankToNull(userProfileFieldsSchema.shape.contactPhone),
});

type FormValues = z.input<typeof formSchema>;

const formValues = (profile: UserProfileResponse['profile']): FormValues => {
  return {
    displayName: profile?.displayName ?? '',
    bio: profile?.bio ?? '',
    location: profile?.location ?? '',
    occupation: profile?.occupation ?? '',
    contactEmail: profile?.contactEmail ?? '',
    contactPhone: profile?.contactPhone ?? '',
    socialLinks: profile?.socialLinks ?? [],
  };
};

const optionalFields = [
  { name: 'occupation', label: 'Occupation', type: 'text' },
  { name: 'location', label: 'Location', type: 'text' },
  { name: 'contactEmail', label: 'Contact email', type: 'email' },
  { name: 'contactPhone', label: 'Contact phone', type: 'tel' },
];

export const ProfileEditor = ({ data }: { data: UserProfileResponse }) => {
  const { updateUserProfile, clearUserProfile } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = userProfileKey(data.userId);
  const setup = !data.profile?.displayName;
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [notice, setNotice] = useState('');

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isDirty, dirtyFields, isSubmitting },
  } = useForm<FormValues, unknown, UserProfileFields>({
    resolver: zodResolver(formSchema),
    defaultValues: formValues(data.profile),
  });

  const links = useFieldArray({ control, name: 'socialLinks' });
  const busy = isSubmitting || clearing;

  const save = async (values: UserProfileFields) => {
    setNotice('');
    const fields = Object.keys(dirtyFields) as Array<keyof UserProfileFields>;
    const patch = setup
      ? { displayName: values.displayName }
      : Object.fromEntries(fields.map((field) => [field, values[field]]));
    const parsed = updateUpserProfileRequestSchema.safeParse(patch);
    if (!parsed.success) return;

    try {
      await queryClient.cancelQueries({ queryKey, exact: true });
      const result = await updateUserProfile(parsed.data);
      queryClient.setQueryData(queryKey, result);
      reset(formValues(result.profile));
      setNotice('Profile saved');
    } catch {
      setError('root.server', {
        message: 'We could not save your profile. Try again.',
      });
    }
  };

  const clearProfile = async () => {
    setClearing(true);
    setNotice('');
    clearErrors('root.server');
    try {
      await queryClient.cancelQueries({ queryKey, exact: true });
      await clearUserProfile();
      queryClient.setQueryData<UserProfileResponse>(queryKey, {
        userId: data.userId,
        profile: null,
      });
      reset(formValues(null));
      setConfirmClear(false);
      setNotice('Profile cleared.');
    } catch {
      setError('root.server', {
        message: 'We could not clear your profile. Try again.',
      });
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="grid gap-4">
      <form onSubmit={handleSubmit(save)} noValidate aria-busy={busy}>
        <fieldset disabled={clearing || confirmClear} className="grid gap-4">
          <FormField
            id="profile-name"
            label="Display name"
            error={errors.displayName?.message}
          >
            {(control) => (
              <InputGroupInput
                {...register('displayName')}
                {...control}
                readOnly={isSubmitting}
                autoComplete="name"
                autoFocus={setup}
                required
              />
            )}
          </FormField>
          {!setup && (
            <>
              <FormField
                id="profile-bio"
                label="Bio"
                error={errors.bio?.message}
              >
                {(control) => (
                  <InputGroupTextarea
                    {...register('bio')}
                    {...control}
                    readOnly={isSubmitting}
                    rows={4}
                  />
                )}
              </FormField>
              {optionalFields.map(({ name, label, type }) => (
                <FormField
                  key={name}
                  id={`profile-${name}`}
                  label={label}
                  error={errors[name]?.message}
                >
                  {(control) => (
                    <InputGroupInput
                      {...register(name)}
                      {...control}
                      readOnly={isSubmitting}
                      type={type}
                      placeholder={type === 'tel' ? '+14155550123' : undefined}
                    />
                  )}
                </FormField>
              ))}
              <section
                aria-labelledby="social-links-title"
                className="grid gap-3"
              >
                <h3 id="social-links-title" className="text-sm font-medium">
                  Social links
                </h3>
                {links.fields.map((link, index) => (
                  <div
                    key={link.id}
                    className="grid gap-3 rounded-md border border-border p-3"
                  >
                    {(['label', 'url'] as const).map((name) => (
                      <FormField
                        key={name}
                        id={`profile-link-${index}-${name}`}
                        label={name === 'label' ? 'Link label' : 'HTTPS URL'}
                        error={errors.socialLinks?.[index]?.[name]?.message}
                      >
                        {(control) => (
                          <InputGroupInput
                            {...register(`socialLinks.${index}.${name}`)}
                            {...control}
                            readOnly={isSubmitting}
                            type={name === 'url' ? 'url' : 'text'}
                          />
                        )}
                      </FormField>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-11 w-fit"
                      disabled={isSubmitting}
                      onClick={() => links.remove(index)}
                    >
                      Remove link {index + 1}
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 w-fit"
                  disabled={isSubmitting || links.fields.length >= 8}
                  onClick={() => links.append({ label: '', url: '' })}
                >
                  Add social link
                </Button>
              </section>
            </>
          )}
          <Button
            type="submit"
            className="min-h-11 w-fit"
            disabled={isSubmitting || (!setup && !isDirty)}
          >
            {isSubmitting ? 'Saving…' : setup ? 'Save name' : 'Save profile'}
          </Button>
        </fieldset>
      </form>
      {data.profile && !confirmClear && (
        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-fit"
          disabled={busy}
          onClick={() => setConfirmClear(true)}
        >
          Clear profile
        </Button>
      )}
      {confirmClear && (
        <div
          role="group"
          aria-label="Confirm clearing profile"
          className="grid gap-3 rounded-md border border-border p-3"
        >
          <p className="text-sm">
            This clears your name and profile details. You can add a name again
            from Account.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="destructive"
              className="min-h-11"
              disabled={busy}
              onClick={() => void clearProfile()}
            >
              {clearing ? 'Clearing…' : 'Clear saved profile'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              disabled={busy}
              onClick={() => setConfirmClear(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      {errors.root?.server && (
        <p role="alert" className="text-sm text-destructive">
          {errors.root.server.message}
        </p>
      )}
      {notice && (
        <p role="status" className="text-sm text-muted-foreground">
          {notice}
        </p>
      )}
    </div>
  );
};
