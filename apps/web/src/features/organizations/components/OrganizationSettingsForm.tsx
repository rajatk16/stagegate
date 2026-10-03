import { User } from 'firebase/auth';
import { useForm, useWatch } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';

import { ApiError } from '@/lib';

import { useOrganizations } from '../hooks';
import { OrganizationLogo } from './OrganizationLogo';
import {
  Button,
  InputField,
  InlineAlert,
  SubmitButton,
  TextareaField,
  ConfirmDialog,
} from '@/components';
import {
  Organization,
  removeOrganizationLogo,
  uploadOrganizationLogo,
  hasOrganizationCapability,
  ORGANIZATION_COLOR_PATTERN,
  OrganizationSettingsUpdate,
  OrganizationSettingsValues,
  updateOrganizationSettings,
  getOrganizationSettingsErrorMessage,
} from '../services';

type Props = {
  user: User;
  organization: Organization;
};

type FormValues = {
  name: string;
  description: string;
  websiteURL: string;
  primaryColor: string;
  secondaryColor: string;
};

type BrandColorField = 'primaryColor' | 'secondaryColor';

const brandColorFields: ReadonlyArray<{
  field: BrandColorField;
  label: string;
  fallback: string;
}> = [
  { field: 'primaryColor', label: 'Primary color', fallback: '#2563EB' },
  { field: 'secondaryColor', label: 'Secondary color', fallback: '#7C3AED' },
];

const toFormValues = (
  organization: OrganizationSettingsValues,
): FormValues => ({
  name: organization.name,
  description: organization.description ?? '',
  websiteURL: organization.websiteURL ?? '',
  primaryColor: organization.primaryColor ?? '',
  secondaryColor: organization.secondaryColor ?? '',
});

const toSettings = (values: FormValues): OrganizationSettingsValues => ({
  name: values.name.trim(),
  description: values.description.trim() || null,
  websiteURL: values.websiteURL.trim() || null,
  primaryColor: values.primaryColor.trim().toUpperCase() || null,
  secondaryColor: values.secondaryColor.trim().toUpperCase() || null,
});

const validateWebsite = (value: string): true | string => {
  const website = value.trim();
  if (!website) return true;
  if (website.length > 2_048) return 'Use 2,048 characters or fewer.';

  try {
    const url = new URL(website);

    return (
      (url.protocol === 'https:' && !url.username && !url.password) ||
      'Enter an HTTPS website URL without embedded credentials.'
    );
  } catch {
    return 'Enter a complete URL, such as https://example.com.';
  }
};

export const OrganizationSettingsForm = (props: Props) => {
  const { replaceOrganization, reload } = useOrganizations();

  const baseLine = useRef<OrganizationSettingsValues>(
    toSettings(toFormValues(props.organization)),
  );

  const requestRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);

  const [pending, setPending] = useState<
    'settings' | 'upload' | 'remove' | null
  >(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [accessLost, setAccessLost] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    control,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: toFormValues(props.organization),
    mode: 'onBlur',
  });

  const [primaryColor = '', secondaryColor = ''] = useWatch({
    control,
    name: ['primaryColor', 'secondaryColor'],
  });
  const colorValues: Record<BrandColorField, string> = {
    primaryColor,
    secondaryColor,
  };

  const canEdit =
    !accessLost &&
    hasOrganizationCapability(props.organization, 'organization:update');

  const busy = pending !== null;

  useEffect(() => {
    return () => {
      requestRef.current?.abort();

      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  const setSelectedFile = (selected: File | null) => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
    }

    const nextPreview = selected ? URL.createObjectURL(selected) : null;

    previewRef.current = nextPreview;
    setFile(selected);
    setPreview(nextPreview);
  };

  const clearFile = () => {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const run = async (
    kind: 'settings' | 'upload' | 'remove',
    request: (signal: AbortSignal) => Promise<Organization>,
    afterSuccess: (updated: Organization) => void,
  ) => {
    if (requestRef.current || !canEdit) return;

    const controller = new AbortController();
    requestRef.current = controller;

    setPending(kind);
    setNotice(null);
    clearErrors('root');

    try {
      const updated = await request(controller.signal);

      if (controller.signal.aborted) return;

      afterSuccess(updated);
      replaceOrganization(updated);
    } catch (error: unknown) {
      if (controller.signal.aborted) return;

      if (
        error instanceof ApiError &&
        (error.status === 403 || error.status === 404)
      ) {
        setAccessLost(true);
      }

      setError('root.server', {
        type: 'server',
        message: getOrganizationSettingsErrorMessage(error),
      });
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
      }

      if (!controller.signal.aborted) {
        setPending(null);
      }
    }
  };

  const submit = async (draft: FormValues) => {
    const normalized = toSettings(draft);

    const changes = Object.fromEntries(
      Object.entries(normalized).filter(
        ([key, value]) =>
          value !== baseLine.current[key as keyof OrganizationSettingsValues],
      ),
    ) as OrganizationSettingsUpdate;

    if (Object.keys(changes).length === 0) {
      reset(toFormValues(normalized));

      setNotice('There are no changes to save.');

      return;
    }

    await run(
      'settings',
      (signal) =>
        updateOrganizationSettings(
          props.user,
          props.organization.id,
          changes,
          signal,
        ),
      (updated) => {
        baseLine.current = toSettings(toFormValues(updated));
        reset(toFormValues(updated));
        setNotice('Organization settings saved.');
      },
    );
  };

  return (
    <form
      noValidate
      aria-busy={busy}
      className="space-y-6"
      onSubmit={(event) => {
        void handleSubmit(submit)(event);
      }}
    >
      <fieldset
        disabled={busy || !canEdit}
        className="min-w-0 space-y-6 border-0 p-0"
      >
        <legend className="sr-only">Organization settings</legend>

        <section className="space-y-6 rounded-2xl border bg-card p-6">
          <h2 className="text-xl font-semibold">Organizaiton details</h2>

          <InputField
            id="organization-settings-name"
            label="Organization name"
            autoComplete="organization"
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
            id="organization-settings-description"
            label="Description"
            hint="Optional. Up to 1,000 characters."
            rows={5}
            error={errors.description?.message}
            {...register('description', {
              validate: (value) =>
                Array.from(value.trim()).length <= 1_000 ||
                'Use 1,000 characters or fewer.',
            })}
          />

          <InputField
            id="organization-settings-website"
            label="Website"
            type="url"
            placeholder="https://example.com"
            hint="Optional. Use a complete HTTPS URL."
            error={errors.websiteURL?.message}
            {...register('websiteURL', {
              validate: validateWebsite,
            })}
          />

          <div>
            <p className="text-sm font-medium">Organization slug</p>
            <p className="mt-1 break-all text-sm text-muted-foreground">
              {props.organization.slug}
            </p>
          </div>
        </section>

        <section className="space-y-6 rounded-2xl border bg-card p-6">
          <h2 className="text-xl font-semibold">Brand colors</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {brandColorFields.map(({ field, label, fallback }) => {
              const value = colorValues[field].trim();
              const color = ORGANIZATION_COLOR_PATTERN.test(value)
                ? value
                : fallback;

              return (
                <div className="space-y-3" key={field}>
                  <InputField
                    id={`organization-${field}`}
                    label={label}
                    placeholder={fallback}
                    hint="Optional. Leave blank to use the default."
                    error={errors[field]?.message}
                    {...register(field, {
                      validate: (input) =>
                        !input.trim() ||
                        ORGANIZATION_COLOR_PATTERN.test(input.trim()) ||
                        'Use six-digit hex, such as #2563EB',
                    })}
                  />

                  <input
                    type="color"
                    aria-label={`Choose ${label.toLowerCase()}`}
                    value={color}
                    onChange={(event) =>
                      setValue(field, event.target.value.toUpperCase(), {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    className="h-11 w-full cursor-pointer rounded-xl border bg-background p-1"
                  />
                </div>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-xl border">
            <div className="flex h-3" aria-hidden="true">
              <div
                className="flex-1"
                style={{
                  backgroundColor: ORGANIZATION_COLOR_PATTERN.test(
                    colorValues.primaryColor.trim(),
                  )
                    ? colorValues.primaryColor.trim()
                    : '#2563EB',
                }}
              />
              <div
                className="flex-1"
                style={{
                  backgroundColor: ORGANIZATION_COLOR_PATTERN.test(
                    colorValues.secondaryColor.trim(),
                  )
                    ? colorValues.secondaryColor.trim()
                    : '#7C3AED',
                }}
              />
            </div>
            <p className="p-4 text-sm">Brand color preview</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <SubmitButton
              pending={pending === 'settings'}
              pendingLabel="Saving settings..."
              disabled={!isDirty || busy}
              className="min-h-11"
            >
              Save settings
            </SubmitButton>

            <ConfirmDialog
              triggerLabel="Discard edits"
              title="Discard text and color edits?"
              description="Your text and color fields will return to their last saved values. Upload logos are saved separately."
              confirmLabel="Discard edits"
              disabled={!isDirty || busy}
              onConfirm={() => {
                reset(toFormValues(baseLine.current));
                setNotice(null);
              }}
            />
          </div>
        </section>

        <section className="space-y-5 rounded-2xl border bg-card p-6">
          <h2 className="text-xl font-semibold">Organization logo</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            PNG, JPEG, or WebP, up to 2MiB. Uploading or removing a logo saves
            it separately from your text and color edits.
          </p>

          <div className="flex flex-wrap items-center gap-5">
            <OrganizationLogo
              user={props.user}
              organizationId={props.organization.id}
              version={props.organization.logoVersion}
              name={props.organization.name}
            />

            {preview && (
              <div className="space-y-2">
                <img
                  src={preview}
                  alt="Selected logo preview"
                  className="size-20 rounded-xl border object-contain p-1"
                />
                <p className="text-xs text-muted-foreground">
                  Selected file - not uploaded yet
                </p>
              </div>
            )}
          </div>

          <label
            htmlFor="organization-logo-file"
            className="block text-sm font-medium"
          >
            Choose a logo
          </label>

          <input
            ref={fileInputRef}
            id="organization-logo-file"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="block w-full min-w-0 text-sm"
            onChange={(event) => {
              const selected = event.target.files?.[0] ?? null;
              setNotice(null);
              clearErrors('root');

              if (
                selected &&
                (selected.size > 2 * 1024 * 1024 ||
                  (selected.type !== '' &&
                    !['image/png', 'image/jpeg', 'image/webp'].includes(
                      selected.type,
                    )))
              ) {
                clearFile();
                setError('root.server', {
                  type: 'validate',
                  message: 'Choose a PNG, JPEG, or WebP image up to 2MiB.',
                });
                return;
              }
              setSelectedFile(selected);
            }}
          />

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              className="min-h-11"
              disabled={!file || busy}
              onClick={() => {
                if (!file) return;

                void run(
                  'upload',
                  (signal) =>
                    uploadOrganizationLogo(
                      props.user,
                      props.organization.id,
                      file,
                      signal,
                    ),
                  () => {
                    clearFile();
                    setNotice('Organization logo uploaded.');
                  },
                );
              }}
            >
              {pending === 'upload' ? 'Uploading...' : 'Upload logo'}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              disabled={!file || busy}
              onClick={clearFile}
            >
              Clear selection
            </Button>

            <ConfirmDialog
              triggerLabel="Remove saved logo"
              title="Remove this organization’s logo?"
              description="The saved logo will be removed and any selected file will be cleared."
              confirmLabel="Remove logo"
              destructive
              disabled={!props.organization.logoVersion || busy}
              onConfirm={() =>
                run(
                  'remove',
                  (signal) =>
                    removeOrganizationLogo(
                      props.user,
                      props.organization.id,
                      signal,
                    ),
                  () => {
                    clearFile();
                    setNotice('Organization logo removed.');
                  },
                )
              }
            />
          </div>
        </section>
      </fieldset>

      {errors.root?.server?.message && (
        <InlineAlert tone="error" title="Request could not be completed">
          {errors.root.server.message}
        </InlineAlert>
      )}

      {notice && !busy && <InlineAlert tone="success">{notice}</InlineAlert>}

      <p role="status" className="text-sm text-muted-foreground">
        {busy
          ? pending === 'settings'
            ? 'Saving settings…'
            : 'Updating logo…'
          : isDirty
            ? 'You have unsaved text or color edits.'
            : ''}
      </p>

      {accessLost && (
        <ConfirmDialog
          triggerLabel="Refresh access"
          title="Refresh organization access?"
          description="This reloads your permissions and discards the current unsaved draft."
          confirmLabel="Refresh access"
          onConfirm={reload}
        />
      )}
    </form>
  );
};
