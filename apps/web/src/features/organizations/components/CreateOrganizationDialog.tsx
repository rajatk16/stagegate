import { z } from 'zod';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { ApiError } from '../../../lib';
import { useOrganization } from '../context';

const createOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Organization name must contain at least 2 characters')
    .max(120, 'Organization name cannot exceed 120 characters'),
});

type CreateOrganizationValues = z.infer<typeof createOrganizationSchema>;

interface CreateOrganizationDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.problem.detail;
  }

  return 'The organization could not be created. Please try again.';
};

export const CreateOrganizationDialog = (props: CreateOrganizationDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { createOrganization, isCreating } = useOrganization();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateOrganizationValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    const dialog = dialogRef.current;

    if (dialog === null) return;

    if (props.isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!props.isOpen && dialog.open) {
      dialog.close();
    }
  }, [props.isOpen]);

  const closeDialog = () => {
    reset();
    props.onClose();
  };

  const submit = async (values: CreateOrganizationValues) => {
    try {
      await createOrganization(values.name);
    } catch (error: unknown) {
      setError('root', {
        message: getErrorMessage(error),
      });
    }
  };

  return (
    <dialog
      aria-labelledby="create-organization-title"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-950/40"
      onCancel={props.onClose}
      onClose={props.onClose}
      ref={dialogRef}
    >
      <form
        className="p-6"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit(submit)(event);
        }}
      >
        <h2 className="text-xl font-semibold text-slate-950" id="create-organization-title">
          Create Organization
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          You will become the owner of this organization.
        </p>
        {errors.root?.message !== undefined ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {errors.root.message}
          </div>
        ) : null}
        <div className="mt-5">
          <label className="block text-sm font-semibold text-slate-800" htmlFor="organization-name">
            Organization Name
          </label>
          <input
            {...register('name')}
            aria-describedby={errors.name === undefined ? undefined : 'organization-name-error'}
            aria-invalid={errors.name !== undefined}
            autoComplete="organization"
            autoFocus
            className="focus:border-brand-600 mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-950 shadow-sm"
            id="organization-name"
            type="text"
          />
          {errors.name?.message !== undefined ? (
            <p className="mt-2 text-sm text-red-700" id="organization-name-error">
              {errors.name.message}
            </p>
          ) : null}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            disabled={isCreating}
            onClick={closeDialog}
            type="button"
          >
            Cancel
          </button>
          <button
            className="bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 rounded-lg px-4 py-2 text-sm font-semibold text-white"
            disabled={isCreating}
            type="submit"
          >
            {isCreating ? 'Creating...' : 'Create Organization'}
          </button>
        </div>
      </form>
    </dialog>
  );
};
