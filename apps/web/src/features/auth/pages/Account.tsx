import { Link, Navigate, useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/constants/variants';
import { PageContainer } from '@/components/layout/PageContainer';

import { useAuth } from '../context/auth';
import { useUserProfile } from '../hooks/useUserProfile';
import { ProfileEditor } from '../components/ProfileEditor';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const AccountDate = ({ value }: { value: string | null }) => {
  if (!value) return 'Unavailable';
  return <time dateTime={value}>{dateFormatter.format(new Date(value))}</time>;
};

export const Account = () => {
  const { session, getAccountDetails } = useAuth();
  const userId = session.status === 'active' ? session.identity.userId : null;
  const [params] = useSearchParams();
  const setup = params.get('setup') === '1';
  const profile = useUserProfile();
  const account = useQuery({
    queryKey: ['account-details', userId],
    enabled: userId !== null && !setup,
    queryFn: ({ signal }) => getAccountDetails(signal),
  });

  if (setup && profile.isSuccess && profile.data.profile?.displayName) {
    return <Navigate to="/app" replace />;
  }

  const profileSection = (
    <section aria-label="Profile" className="grid gap-4">
      {!setup && <h2 className="text-base font-semibold">Profile</h2>}
      {profile.isPending && (
        <p role="status" className="text-sm text-muted-foreground">
          Loading profile…
        </p>
      )}
      {profile.isError && (
        <div className="grid gap-2">
          <p role="alert" className="text-sm text-destructive">
            We couldn’t load your profile.
          </p>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-fit"
            disabled={profile.isFetching}
            onClick={() => void profile.refetch()}
          >
            Try again
          </Button>
        </div>
      )}
      {profile.data && (
        <ProfileEditor key={profile.data.userId} data={profile.data} />
      )}
    </section>
  );

  if (setup) {
    return (
      <PageContainer
        title="Add your name"
        description="This is the name you’ll see in your StageGate workspace."
      >
        {profileSection}
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Account"
      description="Manage your profile and sign-in details."
    >
      {profileSection}
      <section
        aria-labelledby="sign-in-details-title"
        className="mt-8 grid gap-4 border-t border-border pt-5"
      >
        <h2 id="sign-in-details-title" className="text-base font-semibold">
          Sign-in details
        </h2>
        {account.isPending && (
          <p role="status" className="text-sm text-muted-foreground">
            Loading account details...
          </p>
        )}
        {account.isError && (
          <div className="grid gap-3">
            <p role="alert" className="text-sm text-destructive">
              We couldn't load your account details.
            </p>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-fit cursor-pointer"
              disabled={account.isFetching}
              onClick={() => void account.refetch()}
            >
              {account.isFetching ? 'Retrying...' : 'Try again'}
            </Button>
          </div>
        )}
        {account.isSuccess && (
          <dl className="grid gap-4 text-sm">
            <div>
              <dt className="font-medium">Email address</dt>
              <dd className="mt-1 wrap-anywhere text-muted-foreground">
                {account.data.email}
              </dd>
            </div>
            <div>
              <dt className="font-medium">Email verification</dt>
              <dd className="mt-1 text-muted-foreground">Verified</dd>
            </div>
            <div>
              <dt className="font-medium">Account created</dt>
              <dd className="mt-1 text-muted-foreground">
                <AccountDate value={account.data.createdAt} />
              </dd>
            </div>
            <div>
              <dt className="font-medium">Last sign-in</dt>
              <dd className="mt-1 text-muted-foreground">
                <AccountDate value={account.data.lastSignInAt} />
              </dd>
            </div>
          </dl>
        )}
        <div>
          <Link
            to="/app/account/password"
            className={buttonVariants({ size: 'lg', className: 'min-h-11' })}
          >
            Change password
          </Link>
        </div>
      </section>
    </PageContainer>
  );
};
