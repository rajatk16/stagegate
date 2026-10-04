import type { User } from 'firebase/auth';
import { useForm } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';

import { ApiError } from '@/lib';
import { InlineAlert, InputField, SubmitButton } from '@/components';

import {
  Organization,
  createOrganization,
  CreateOrganizationInput,
  suggestOrganizationSlug,
  normalizeOrganizationSlug,
  ORGANIZATION_SLUG_PATTERN,
  getOrganizationErrorMessage,
} from '../services';

type CreateOrganizationFormProps = {
  user: User;
  onCreated: (organization: Organization) => void;
};

export const CreateOrganizationForm = ({
  user,
  onCreated,
}: CreateOrganizationFormProps) => {
  const [pending, setPending] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  const focusSlugRef = useRef(false);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    setFocus,
    clearErrors,
    formState: { errors },
  } = useForm<CreateOrganizationInput>({
    defaultValues: {
      name: '',
      slug: '',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    return () => {
      requestRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!pending && focusSlugRef.current) {
      focusSlugRef.current = false;
      setFocus('slug');
    }
  }, [pending, setFocus]);

  const submit = async (values: CreateOrganizationInput) => {
    if (requestRef.current) return;

    const controller = new AbortController();
    requestRef.current = controller;

    setPending(true);
    clearErrors('root');

    try {
      const organization = await createOrganization(
        user,
        values,
        controller.signal,
      );

      if (controller.signal.aborted) return;

      onCreated(organization);
    } catch (error: unknown) {
      if (controller.signal.aborted) return;

      if (
        error instanceof ApiError &&
        (error.code === 'ORGANIZATION_SLUG_TAKEN' ||
          error.code === 'ORGANIZATION_SLUG_RESERVED')
      ) {
        const message =
          error.code === 'ORGANIZATION_SLUG_TAKEN'
            ? 'This slug is already in use. Choose another.'
            : 'This slug is reserved. Choose another.';

        setError('slug', {
          type: 'server',
          message,
        });

        focusSlugRef.current = true;
        return;
      }

      setError('root.server', {
        type: 'server',
        message: getOrganizationErrorMessage(error),
      });
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
      }

      if (!controller.signal.aborted) {
        setPending(false);
      }
    }
  };

  return (
    <form
      noValidate
      aria-busy={pending}
      className="space-y-6"
      onSubmit={(event) => {
        void handleSubmit(submit)(event);
      }}
    >
      <fieldset disabled={pending} className="min-w-0 space-y-6 border-0 p-0">
        <legend className="sr-only">Organization details</legend>

        <InputField
          id="organization-name"
          label="Organization name"
          placeholder="Acme Research"
          autoComplete="organization"
          required
          hint="Use 2–120 characters."
          error={errors.name?.message}
          {...register('name', {
            validate: (value) => {
              const length = Array.from(value.trim()).length;

              if (length < 2) {
                return 'Enter an organization name with at least 2 characters.';
              }

              if (length > 120) {
                return 'Use 120 characters or fewer.';
              }

              return true;
            },
            onChange: (event) => {
              clearErrors('root');

              if (!slugEdited) {
                setValue(
                  'slug',
                  suggestOrganizationSlug(event.target.value as string),
                  {
                    shouldDirty: true,
                  },
                );

                clearErrors('slug');
              }
            },
          })}
        />

        <InputField
          id="organization-slug"
          label="Organization slug"
          placeholder="acme-research"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
          hint="A unique identifier: 3–63 lowercase letters, numbers, or single hyphens between words."
          error={errors.slug?.message}
          {...register('slug', {
            validate: (value) => {
              const slug = normalizeOrganizationSlug(value);

              if (slug.length < 3 || slug.length > 63) {
                return 'Use between 3 and 63 characters.';
              }

              if (!ORGANIZATION_SLUG_PATTERN.test(slug)) {
                return 'Use letters and numbers separated by single hyphens.';
              }

              return true;
            },
            onChange: () => {
              setSlugEdited(true);
              clearErrors('root');
            },
          })}
        />
      </fieldset>

      {errors.root?.server?.message && (
        <InlineAlert
          tone="error"
          title="Organization creation could not be confirmed"
        >
          {errors.root.server.message}
        </InlineAlert>
      )}

      <p className="text-sm leading-6 text-muted-foreground">
        You will become the owner of this organization.
      </p>

      <SubmitButton
        pending={pending}
        pendingLabel="Creating organization…"
        className="min-h-11 w-full sm:w-auto"
      >
        Create organization
      </SubmitButton>
    </form>
  );
};
