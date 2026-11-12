import { Link, Navigate } from 'react-router';

import { useAuth } from '@/features/auth/context/auth';
import { useUserProfile } from '@/features/auth/hooks/useUserProfile';
import { PageContainer } from '@/components/layout/PageContainer';

export function Workspace() {
  const { session } = useAuth();
  const profile = useUserProfile();
  if (session.status !== 'active') return null;

  const displayName = profile.data?.profile?.displayName;
  if (profile.isPending) {
    return (
      <PageContainer
        title="Your workspace"
        description="Checking your profile…"
      />
    );
  }
  if (profile.isSuccess && !displayName) {
    return <Navigate to="/app/account?setup=1" replace />;
  }
  return (
    <PageContainer
      title="Your workspace"
      description={
        displayName
          ? `Welcome, ${displayName}.`
          : 'Open Account to manage your profile.'
      }
    >
      <Link
        to="/app/account"
        className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline underline-offset-4"
      >
        Account
      </Link>
    </PageContainer>
  );
}
