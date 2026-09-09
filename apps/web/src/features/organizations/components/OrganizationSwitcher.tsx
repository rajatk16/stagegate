import { useState } from 'react';

import { useOrganization } from '../context';
import { CreateOrganizationDialog } from './CreateOrganizationDialog';

export const OrganizationSwitcher = () => {
  const { organizations, activeOrganization, isLoading, error, reload, selectOrganization } =
    useOrganization();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <span className="text-sm text-slate-500" role="status">
        Loading organizations...
      </span>
    );
  }

  if (error !== null) {
    return (
      <button
        className="rounded-lg px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
        onClick={reload}
        type="button"
      >
        Retry Organizations
      </button>
    );
  }

  return (
    <>
      <div className="flex-min-w-0 items-center gap-2">
        <label className="sr-only" htmlFor="organization-switcher">
          Active Organization
        </label>
        <select
          className="focus:border-brand-600 min-w-0 max-w-52 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
          disabled={organizations.length === 0}
          id="organization-switcher"
          onChange={(event) => {
            selectOrganization(event.target.value);
          }}
          value={activeOrganization?.organizationId ?? ''}
        >
          {organizations.length === 0 ? <option value="">No organizations found</option> : null}
          {organizations.map((organization) => {
            return (
              <option key={organization.organizationId} value={organization.organizationId}>
                {organization.name}
              </option>
            );
          })}
        </select>

        <button
          className="text-brand-700 hover:bg-brand-50 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold"
          onClick={() => setIsCreateDialogOpen(true)}
          type="button"
        >
          New Organization
        </button>
      </div>

      <CreateOrganizationDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
    </>
  );
};
