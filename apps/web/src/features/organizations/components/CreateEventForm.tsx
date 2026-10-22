import { User } from 'firebase/auth';
import { useForm } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';

import { ApiError } from '@/lib';
import { InlineAlert, InputField, SubmitButton } from '@/components';

import { EVENT_SLUG_PATTERN } from '../constants';
import { createOrganizationEvent } from '../services';
import { CreateEventInput, OrganizationEvent } from '../types';
import {
  getEventsError,
  suggestEventSlug,
  normalizeEventSlug,
  isEventCreationUncertain,
} from '../utils';
import { queryKeys, useApiMutation } from '@/app/query';

type Props = {
  user: User;
  organizationId: string;
  onCreated: (event: OrganizationEvent) => void;
};

export const CreateEventForm = ({ user, organizationId, onCreated }: Props) => {
  const [pending, setPending] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [uncertain, setUncertain] = useState(false);

  const requestRef = useRef<AbortController | null>(null);
  const focusSlugRef = useRef(false);

  const createMutation = useApiMutation({
    user,
    request: createOrganizationEvent,
    affected: [
      queryKeys.resources(user.uid, organizationId, 'events'),
      queryKeys.resources(user.uid, organizationId, 'activity'),
    ],
  });

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    setFocus,
    formState: { errors },
  } = useForm<CreateEventInput>({
    defaultValues: { name: '', slug: '' },
    mode: 'onBlur',
  });

  useEffect(() => () => requestRef.current?.abort(), []);

  useEffect(() => {
    if (!pending && focusSlugRef.current) {
      focusSlugRef.current = false;
      setFocus('slug');
    }
  }, [pending, setFocus]);

  const submit = async (values: CreateEventInput) => {
    if (requestRef.current !== null) return;

    const controller = new AbortController();
    requestRef.current = controller;

    setPending(true);
    clearErrors('root');

    let created: OrganizationEvent | null = null;
    try {
      created = await createMutation.execute(
        organizationId,
        values,
        controller.signal,
      );
    } catch (error: unknown) {
      if (controller.signal.aborted) return;

      if (error instanceof ApiError && error.code === 'EVENT_SLUG_TAKEN') {
        setError('slug', {
          type: 'server',
          message: uncertain
            ? 'An event now uses this slug. Check the list: your earlier request may have succeeded.'
            : 'This slug is already used in this organization. Choose another.',
        });
        focusSlugRef.current = true;
      } else {
        if (isEventCreationUncertain(error)) {
          setUncertain(true);
        }

        setError('root.server', {
          type: 'server',
          message: getEventsError(error, 'create'),
        });
      }
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
      }

      if (!controller.signal.aborted) {
        setPending(false);
      }
    }

    if (created && !controller.signal.aborted) {
      onCreated(created);
    }
  };

  return (
    <form
      noValidate
      aria-busy={pending}
      className="space-y-6"
      onSubmit={(event) => void handleSubmit(submit)(event)}
    >
      <fieldset disabled={pending} className="min-w-0 space-y-6 border-0 p-0">
        <legend className="sr-only">Event Details</legend>

        <InputField
          id="event-name"
          label="Event name"
          placeholder="Annual Research Conference"
          autoComplete="off"
          required
          readOnly={uncertain}
          hint="Use 2–120 characters."
          error={errors.name?.message}
          {...register('name', {
            validate: (value) => {
              const length = Array.from(value.trim()).length;

              return (
                (length >= 2 && length <= 120) ||
                'Use an event name between 2 and 120 characters.'
              );
            },
            onChange: (event) => {
              clearErrors('root');

              if (!slugEdited) {
                setValue(
                  'slug',
                  suggestEventSlug(event.target.value as string),
                  { shouldDirty: true },
                );
                clearErrors('slug');
              }
            },
          })}
        />

        <InputField
          id="event-slug"
          label="Event slug"
          placeholder="annual-research-conference"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
          readOnly={uncertain}
          hint="Unique within this organization. Use 3–63 lowercase letters, numbers, and single hyphens between words."
          error={errors.slug?.message}
          {...register('slug', {
            validate: (value) => {
              const slug = normalizeEventSlug(value);

              if (slug.length < 3 || slug.length > 63) {
                return 'Use between 3 and 63 characters.';
              }

              return (
                EVENT_SLUG_PATTERN.test(slug) ||
                'Use letters and numbers separated by single hyphens.'
              );
            },
            onChange: () => {
              setSlugEdited(true);
              clearErrors('root');
            },
          })}
        />
      </fieldset>

      {errors.root?.server?.message && (
        <InlineAlert tone="error" title="Creation could not be confirmed">
          {errors.root.server.message}
        </InlineAlert>
      )}

      {uncertain && (
        <InlineAlert tone="warning" title="Check before creating another event">
          Your details are preserved. Check the event list for this slug. If you
          retry here, the same slug will be used to avoid creating a second
          event under a different slug.
        </InlineAlert>
      )}

      <p className="text-sm leading-6 text-muted-foreground">
        The event will be created as a Draft.
      </p>

      <SubmitButton
        pending={pending}
        pendingLabel="Creating event…"
        className="min-h-11 w-full sm:w-auto"
      >
        {uncertain ? 'Retry with the same slug' : 'Create draft event'}
      </SubmitButton>
    </form>
  );
};
