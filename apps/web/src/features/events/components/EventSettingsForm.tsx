import { User } from 'firebase/auth';
import { useForm } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { ApiError } from '@/lib';
import { queryKeys, useApiMutation } from '@/app/query';
import {
  InputField,
  InlineAlert,
  SelectField,
  SubmitButton,
  TextareaField,
  ConfirmDialog,
} from '@/components';

import { updateEventSettings } from '../services';
import { EventFormat, EventSettings, UpdateEventSettingsInput } from '../types';
import {
  toEventInstant,
  toEventLocalInput,
  isEventEndAfterStart,
  isValidEventTimezone,
  getEventSettingsError,
  isEventSettingsSaveUncertain,
} from '../utils';

type Props = {
  user: User;
  organizationId: string;
  event: EventSettings;
  canEdit: boolean;
  onReload: () => Promise<EventSettings>;
  onRefreshAccess: () => Promise<void>;
};

type FormValues = {
  name: string;
  description: string;
  format: '' | EventFormat;
  location: string;
  startsAtLocal: string;
  endsAtLocal: string;
  timezone: string;
};

const toFormValues = (event: EventSettings): FormValues => ({
  name: event.name,
  description: event.description ?? '',
  format: event.format ?? '',
  location: event.location ?? '',
  startsAtLocal: toEventLocalInput(event.startsAt, event.timezone),
  endsAtLocal: toEventLocalInput(event.endsAt, event.timezone),
  timezone: event.timezone,
});

export const EventSettingsForm = (props: Props) => {
  const client = useQueryClient();

  const baselineRef = useRef(props.event);
  const requestRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(false);

  const [saving, setSaving] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [accessLost, setAccessLost] = useState(false);
  const [mustReload, setMustReload] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: toFormValues(props.event),
    mode: 'onBlur',
  });

  const canEdit =
    props.canEdit && !accessLost && props.event.status !== 'ARCHIVED';

  const busy = saving || reloading;

  const mutation = useApiMutation({
    user: props.user,
    request: updateEventSettings,
    affected: [
      queryKeys.event(props.user.uid, props.organizationId, props.event.id),
      queryKeys.resources(props.user.uid, props.organizationId, 'events'),
      queryKeys.resources(props.user.uid, props.organizationId, 'activity'),
    ],
    onSuccess: (updated) => {
      client.setQueryData(
        queryKeys.event(props.user.uid, props.organizationId, props.event.id),
        updated,
      );
    },
  });

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      requestRef.current?.abort();
    };
  }, []);

  const acceptSavedEvent = (updated: EventSettings) => {
    baselineRef.current = updated;
    reset(toFormValues(updated));
    setMustReload(false);
  };

  const submit = async (values: FormValues) => {
    if (requestRef.current || busy || !canEdit || mustReload) {
      return;
    }

    clearErrors('root');
    setNotice(null);

    const timezone = values.timezone.trim();

    if (!isValidEventTimezone(timezone)) {
      setError(
        'timezone',
        {
          type: 'validate',
          message: 'Enter an IANA timezone, such as Asia/Kolkata.',
        },
        { shouldFocus: true },
      );
      return;
    }

    const hasStart = values.startsAtLocal !== '';
    const hasEnd = values.endsAtLocal !== '';

    if (hasStart !== hasEnd) {
      const field = hasStart ? 'endsAtLocal' : 'startsAtLocal';

      setError(
        field,
        {
          type: 'validate',
          message: 'Enter both start and end dates, or leave both empty.',
        },
        { shouldFocus: true },
      );
      return;
    }

    let startsAt: string | null = null;
    let endsAt: string | null = null;

    try {
      startsAt = toEventInstant(values.startsAtLocal, timezone);
    } catch {
      setError(
        'startsAtLocal',
        {
          type: 'validate',
          message:
            'Choose a valid, unambiguous start time in the selected timezone.',
        },
        { shouldFocus: true },
      );
      return;
    }

    try {
      endsAt = toEventInstant(values.endsAtLocal, timezone);
    } catch {
      setError(
        'endsAtLocal',
        {
          type: 'validate',
          message:
            'Choose a valid, unambiguous end time in the selected timezone.',
        },
        { shouldFocus: true },
      );
      return;
    }

    if (
      startsAt !== null &&
      endsAt !== null &&
      !isEventEndAfterStart(startsAt, endsAt)
    ) {
      setError(
        'endsAtLocal',
        {
          type: 'validate',
          message: 'The end must be after the start.',
        },
        { shouldFocus: true },
      );
      return;
    }

    const input: UpdateEventSettingsInput = {
      name: values.name.trim(),
      description: values.description.trim() || null,
      format: values.format || null,
      location: values.location.trim() || null,
      startsAt,
      endsAt,
      timezone,
    };

    const controller = new AbortController();
    requestRef.current = controller;
    setSaving(true);

    try {
      const updated = await mutation.execute(
        props.organizationId,
        props.event.id,
        input,
        controller.signal,
      );

      if (controller.signal.aborted || !mountedRef.current) return;

      acceptSavedEvent(updated);
      setNotice('Event settings saved.');
    } catch (error: unknown) {
      if (controller.signal.aborted || !mountedRef.current) return;

      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403 || error.status === 404)
      ) {
        setAccessLost(true);
      }

      setMustReload(isEventSettingsSaveUncertain(error));

      setError('root.server', {
        type: 'server',
        message: getEventSettingsError(error, 'save'),
      });
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
      }

      if (mountedRef.current) {
        setSaving(false);
      }
    }
  };

  const reloadSaved = async () => {
    if (busy || requestRef.current) return;

    setReloading(true);
    setNotice(null);

    try {
      const updated = await props.onReload();

      if (!mountedRef.current) return;

      acceptSavedEvent(updated);
      setNotice('Saved event settings loaded.');
    } finally {
      if (mountedRef.current) {
        setReloading(false);
      }
    }
  };

  return (
    <form
      noValidate
      aria-busy={busy}
      className="space-y-6"
      onChange={() => setNotice(null)}
      onSubmit={(submitEvent) => {
        void handleSubmit(submit)(submitEvent);
      }}
    >
      <fieldset
        disabled={busy || !canEdit || mustReload}
        className="min-w-0 space-y-6 border-0 p-0"
      >
        <legend className="sr-only">Event settings</legend>

        <section className="space-y-6 rounded-2xl border bg-card p-4 sm:p-6">
          <h3 className="text-lg font-semibold">Event details</h3>

          <InputField
            id="event-settings-name"
            label="Title"
            required
            error={errors.name?.message}
            {...register('name', {
              validate: (value) => {
                const length = Array.from(value.trim()).length;

                return (
                  (length >= 2 && length <= 120) ||
                  'Use between 2 and 120 characters.'
                );
              },
            })}
          />

          <TextareaField
            id="event-settings-description"
            label="Description"
            rows={5}
            hint="Optional. Up to 5,000 characters."
            error={errors.description?.message}
            {...register('description', {
              validate: (value) =>
                Array.from(value.trim()).length <= 5_000 ||
                'Use 5,000 characters or fewer.',
            })}
          />

          <SelectField
            id="event-settings-format"
            label="Format"
            error={errors.format?.message}
            {...register('format', {
              validate: (value) =>
                value === '' ||
                value === 'IN_PERSON' ||
                value === 'ONLINE' ||
                value === 'HYBRID' ||
                'Choose a valid event format.',
            })}
          >
            <option value="">Not set</option>
            <option value="IN_PERSON">In person</option>
            <option value="ONLINE">Online</option>
            <option value="HYBRID">Hybrid</option>
          </SelectField>

          <InputField
            id="event-settings-location"
            label="Location"
            hint="Optional. Enter a venue, city, or online location."
            error={errors.location?.message}
            {...register('location', {
              validate: (value) =>
                Array.from(value.trim()).length <= 500 ||
                'Use 500 characters or fewer.',
            })}
          />
        </section>

        <section className="space-y-6 rounded-2xl border bg-card p-4 sm:p-6">
          <h3 className="text-lg font-semibold">Schedule</h3>

          <p className="text-sm text-muted-foreground">
            Dates are optional while preparing the event. Enter both dates when
            you are ready to set the schedule.
          </p>

          <InputField
            id="event-settings-timezone"
            label="Timezone"
            required
            list="event-timezone-options"
            hint="Times below use this timezone. Changing it keeps the entered clock times and changes the corresponding UTC times."
            error={errors.timezone?.message}
            {...register('timezone', {
              validate: (value) =>
                isValidEventTimezone(value.trim()) ||
                'Enter an IANA timezone, such as Asia/Kolkata.',
            })}
          />

          <datalist
            id="event-timezone-options"
            aria-label="Suggested timezones"
          >
            <option value="UTC">UTC</option>
            <option value="Asia/Kolkata">Asia/Kolkata</option>
            <option value="Asia/Singapore">Asia/Singapore</option>
            <option value="Europe/London">Europe/London</option>
            <option value="America/New_York">America/New_York</option>
            <option value="America/Los_Angeles">America/Los_Angeles</option>
            <option value="Australia/Sydney">Australia/Sydney</option>
          </datalist>

          <div className="grid gap-6 sm:grid-cols-2">
            <InputField
              id="event-settings-starts-at"
              label="Starts"
              type="datetime-local"
              step={1}
              error={errors.startsAtLocal?.message}
              {...register('startsAtLocal')}
            />

            <InputField
              id="event-settings-ends-at"
              label="Ends"
              type="datetime-local"
              step={1}
              error={errors.endsAtLocal?.message}
              {...register('endsAtLocal')}
            />
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <SubmitButton
            pending={saving}
            pendingLabel="Saving settings..."
            disabled={!isDirty || busy}
          >
            Save settings
          </SubmitButton>

          <ConfirmDialog
            triggerLabel="Discard edits"
            title="Discard your event edits?"
            description="The form will return to the last saved settings."
            confirmLabel="Discard edits"
            disabled={!isDirty || busy}
            onConfirm={() => {
              reset(toFormValues(baselineRef.current));
              setNotice(null);
            }}
          />
        </div>
      </fieldset>

      {errors.root?.server?.message && (
        <InlineAlert tone="error" title="Could not save settings">
          {errors.root.server.message}
        </InlineAlert>
      )}

      {mustReload && (
        <InlineAlert tone="warning" title="Check the saved settings">
          The server may have received your changes. Reload the saved settings
          before editing or submitting again.
        </InlineAlert>
      )}

      {notice && !busy && <InlineAlert tone="success">{notice}</InlineAlert>}

      <div className="flex flex-wrap gap-3">
        {!accessLost && (
          <ConfirmDialog
            triggerLabel="Reload saved settings"
            title="Reload the saved event settings?"
            description="This replaces your current draft with the settings currently stored on the server."
            confirmLabel="Reload settings"
            pendingLabel="Reloading..."
            errorMessage="Could not reload the settings. Your current draft has been preserved."
            disabled={busy}
            onConfirm={reloadSaved}
          />
        )}

        {accessLost && (
          <ConfirmDialog
            triggerLabel="Refresh access"
            title="Refresh event access?"
            description="This reloads your access and may discard your current unsaved draft."
            confirmLabel="Refresh access"
            onConfirm={props.onRefreshAccess}
          />
        )}
      </div>

      <p role="status" className="text-sm text-muted-foreground">
        {saving
          ? 'Saving event settings…'
          : reloading
            ? 'Loading saved settings…'
            : mustReload
              ? 'Reload saved settings before continuing.'
              : isDirty
                ? 'You have unsaved changes.'
                : ''}
      </p>
    </form>
  );
};
