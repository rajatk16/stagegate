import { Popover } from 'radix-ui';
import { MouseEvent, useId, useRef, useState } from 'react';
import { Link, matchPath, useLocation } from 'react-router';
import {
  Plus,
  Check,
  Search,
  Building2,
  RefreshCw,
  LoaderCircle,
  ChevronsUpDown,
} from 'lucide-react';

import { Button, InlineAlert, Input } from '@/components';
import { getOrganizationPath, ORGANIZATION_ROUTE_PATTERN } from '@/lib';

import { useOrganizations } from '../hooks';

const OrganizationAvatar = ({ name }: { name?: string }) => {
  const initials = name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => Array.from(word)[0])
    .join('')
    .toUpperCase();

  return (
    <span
      aria-hidden="true"
      className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-semibold text-primary"
    >
      {initials || <Building2 className="size-4" />}
    </span>
  );
};

export const OrganizationSwitcher = () => {
  const searchId = useId();
  const location = useLocation();
  const { state, reload } = useOrganizations();

  const navigatingRef = useRef(false);
  const [query, setQuery] = useState('');
  const [openKey, setOpenKey] = useState<string | null>(null);

  const open = openKey === location.key;

  const match = matchPath(
    {
      path: ORGANIZATION_ROUTE_PATTERN,
      end: false,
    },
    location.pathname,
  );

  const organizationSlug = match?.params.organizationSlug;

  const organizations = state.status === 'ready' ? state.organizations : [];

  const activeOrganization = organizations.find(
    (organization) => organization.slug === organizationSlug,
  );

  const search = query.trim().toLowerCase();

  const filteredOrganizations = organizations.filter(
    (organization) =>
      organization.name.toLowerCase().includes(search) ||
      organization.slug.toLowerCase().includes(search),
  );

  const title =
    state.status === 'loading'
      ? 'Loading organizations'
      : state.status === 'error'
        ? 'Organizations unavailable'
        : (activeOrganization?.name ?? 'Choose Organization');

  const subtitle =
    state.status === 'loading'
      ? 'Please wait...'
      : state.status === 'error'
        ? 'Open to retry'
        : organizations.length > 0
          ? ''
          : 'Create your first organization';

  const closeForNavigation = (
    event: MouseEvent<HTMLAnchorElement>,
    destination: string,
  ) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    navigatingRef.current = destination !== location.pathname;
    setOpenKey(null);
    setQuery('');
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(nextOpen) => {
        navigatingRef.current = false;
        setQuery('');
        setOpenKey(nextOpen ? location.key : null);
      }}
    >
      <Popover.Trigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label={`Switch organization. ${title} ${subtitle}`}
          className="h-auto min-h-16 w-full justify-start gap-3 px-3 py-3 text-left"
        >
          <OrganizationAvatar name={activeOrganization?.name} />

          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">
              {title}
            </span>
            <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">
              {subtitle}
            </span>
          </span>

          {state.status === 'loading' ? (
            <LoaderCircle
              aria-hidden="true"
              className="size-4 shrink-0 motion-safe:animate-spin"
            />
          ) : (
            <ChevronsUpDown
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground"
            />
          )}
        </Button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          side="bottom"
          sideOffset={8}
          collisionPadding={16}
          aria-label="Switch organization"
          className="z-50 max-h-(--radix-popover-content-available-height) w-96 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border bg-popover text-popover-foreground shadow-xl outline-none"
          onCloseAutoFocus={(event) => {
            const routeChanged = openKey !== null && openKey !== location.key;

            if (navigatingRef.current || routeChanged) {
              event.preventDefault();

              document
                .getElementById('main-content')
                ?.focus({ preventScroll: true });
            }
            navigatingRef.current = false;
          }}
        >
          <div className="border-b px-4 py-3">
            <p className="text-sm font-semibold">Your organizations</p>
          </div>
          {state.status === 'loading' && (
            <p
              role="status"
              className="px-4 py-6 text-sm text-muted-foreground"
            >
              Loading your organizations...
            </p>
          )}

          {state.status === 'error' && (
            <div className="p-3">
              <InlineAlert tone="error" title="Could not load organizations">
                {state.message}
              </InlineAlert>
            </div>
          )}

          {state.status === 'ready' && organizations.length === 0 && (
            <div className="space-y-2 px-4 py-6">
              <p className="text-sm font-medium">
                Create your first organization
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                Give your team a shared home in StageGate
              </p>
            </div>
          )}

          {state.status === 'ready' && organizations.length > 0 && (
            <>
              <div className="px-3 pt-3">
                <label htmlFor={searchId} className="sr-only">
                  Search organizations by name or slug
                </label>

                <div className="relative">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  />

                  <Input
                    id={searchId}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search organizations..."
                    autoComplete="off"
                    spellCheck={false}
                    className="h-11 pl-9"
                  />
                </div>
              </div>

              <p
                role="status"
                className="px-4 pb-2 pt-3 text-xs text-muted-foreground"
              >
                {filteredOrganizations.length === 0
                  ? 'No organizations match your search.'
                  : `${filteredOrganizations.length} ${
                      filteredOrganizations.length === 1
                        ? 'organization'
                        : 'organizations'
                    }
                        `}
              </p>

              <ul
                aria-label="Your organizations"
                className="max-h-64 space-y-1 overflow-y-auto px-2 pb-2"
              >
                {filteredOrganizations.map((organization) => {
                  const selected = organization.id === activeOrganization?.id;

                  const destination = getOrganizationPath(organization.slug);

                  return (
                    <li key={organization.id}>
                      <Link
                        to={destination}
                        aria-current={selected ? 'true' : undefined}
                        onClick={(event) =>
                          closeForNavigation(event, destination)
                        }
                        className={[
                          'flex min-h-16 items-center gap-3',
                          'rounded-xl px-3 py-2',
                          'outline-none transition-colors',
                          'focus-visible:ring-2 focus-visible:ring-inset',
                          'focus-visible:ring-ring',
                          selected
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-accent hover:text-accent-foreground',
                        ].join(' ')}
                      >
                        <OrganizationAvatar name={organization.name} />

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {organization.name}
                          </span>
                        </span>

                        {selected && (
                          <>
                            <Check
                              aria-hidden="true"
                              className="size-4 shrink-0"
                            />
                            <span className="sr-only">
                              Current organization
                            </span>
                          </>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <div className="space-y-1 border-t p-2">
            <Button
              asChild
              variant="ghost"
              className="min-h-11 w-full justify-start gap-3"
            >
              <Link
                to="/organizations/new"
                onClick={(event) =>
                  closeForNavigation(event, '/organizations/new')
                }
              >
                <Plus aria-hidden="true" className="size-4" />
                Create organization
              </Link>
            </Button>

            <Button
              type="button"
              variant="ghost"
              disabled={state.status === 'loading'}
              onClick={() => {
                setQuery('');
                reload();
              }}
              className="min-h-11 w-full justify-start gap-3"
            >
              <RefreshCw aria-hidden="true" className="size-4" />
              {state.status === 'error' ? 'Try again' : 'Refresh organizations'}
            </Button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
