import { Link } from 'react-router';
import type { User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ArrowRight, Check, Circle } from 'lucide-react';

import { Button, Badge, InlineAlert } from '@/components';
import {
  Profile,
  getProfile,
  getProfileErrorMessage,
} from '@/features/profile/services';

type ProfileState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; profile: Profile };

export const DashboardContent = ({ user }: { user: User }) => {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<ProfileState>({
    status: 'loading',
  });

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const profile = await getProfile(user, controller.signal);

        if (!controller.signal.aborted) {
          setState({ status: 'ready', profile });
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setState({
            status: 'error',
            message: getProfileErrorMessage(error),
          });
        }
      }
    };

    void load();

    return () => controller.abort();
  }, [user, attempt]);

  if (state.status === 'loading') {
    return (
      <div
        role="status"
        className="rounded-2xl border bg-card p-8 text-muted-foreground"
      >
        Loading your workspace…
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <InlineAlert tone="error" title="Could not load your dashboard">
          {state.message}
        </InlineAlert>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setState({ status: 'loading' });
            setAttempt((value) => value + 1);
          }}
        >
          Try again
        </Button>
      </div>
    );
  }

  const { profile } = state;
  const hasName = Boolean(profile.displayName?.trim());
  const hasTimezone = Boolean(profile.timezone?.trim());
  const profileReady = hasName && hasTimezone;

  const checklist = [
    { label: 'Email verified', complete: user.emailVerified },
    { label: 'Name added', complete: hasName },
    { label: 'Timezone selected', complete: hasTimezone },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-card p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="space-y-3">
            <Badge variant="secondary">Your workspace</Badge>
            <h2 className="text-2xl font-semibold tracking-tight">
              Welcome {profile.displayName ? profile.displayName.trim() : ''}.
            </h2>
            <p className="max-w-xl leading-7 text-muted-foreground">
              {profileReady
                ? 'Your profile is ready. You can update your details whenever you need to.'
                : 'Start by adding your name and timezone to finish setting up your profile.'}
            </p>
          </div>

          <Button asChild className="min-h-11">
            <Link to="/profile">
              {profileReady ? 'Edit profile' : 'Complete profile'}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-5 rounded-2xl border bg-card p-6">
          <h2 className="text-lg font-semibold">Getting started</h2>

          <ul className="space-y-4">
            {checklist.map(({ label, complete }) => {
              const Icon = complete ? Check : Circle;

              return (
                <li key={label} className="flex items-center gap-3">
                  <Icon
                    aria-hidden="true"
                    className={`size-5 ${
                      complete ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                  <span>{label}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {complete ? 'Done' : 'To do'}
                  </span>
                </li>
              );
            })}
          </ul>

          <p className="text-sm text-muted-foreground">
            Biography and affiliation are optional.
          </p>
        </section>

        <section className="space-y-5 rounded-2xl border bg-card p-6">
          <h2 className="text-lg font-semibold">Profile at a glance</h2>

          <dl className="space-y-4">
            <div>
              <dt className="text-xs text-muted-foreground">Email</dt>
              <dd className="mt-1 wrap-break-word">
                {user.email ?? 'Not available'}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">Affiliation</dt>
              <dd className="mt-1 wrap-break-word">
                {profile.affiliation || 'Not added'}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">Timezone</dt>
              <dd className="mt-1 wrap-break-word">
                {profile.timezone?.replaceAll('_', ' ') || 'Not selected'}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="rounded-2xl border bg-card p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <Badge variant="secondary">Organizations</Badge>

            <h2 className="text-xl font-semibold">
              Give your team a home in StageGate.
            </h2>

            <p className="leading-7 text-muted-foreground">
              Create an organization for your team, company, or group.
            </p>
          </div>

          <Button asChild className="min-h-11">
            <Link to="/organizations/new">
              Create organization
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="min-h-11">
              <Link to="/organizations">
                Open organizations
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" className="min-h-11">
              <Link to="/organizations/new">Create organization</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
