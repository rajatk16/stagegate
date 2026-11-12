import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/constants/variants';

import { useAuth } from '../context/auth';
import { AuthPanel } from '../components/AuthPanel';

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
  const account = useQuery({
    queryKey: ['account-details', userId],
    enabled: userId !== null,
    queryFn: ({ signal }) => getAccountDetails(signal),
  });

  return (
    <AuthPanel
      title="Account"
      description="Manage your StageGate sign-in details"
    >
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
      <div className="mt-6 border-t border-border pt-4">
        <Link
          to="/app/account/password"
          className={buttonVariants({ size: 'lg', className: 'min-h-11' })}
        >
          Change password
        </Link>
      </div>
    </AuthPanel>
  );
};
