import { useAuth } from '@/features/auth/context/auth';
import { AuthPanel } from '@/features/auth/components/AuthPanel';
import { SignOutButton } from '@/features/auth/components/SignOutButton';

export function Workspace() {
  const { session } = useAuth();
  if (session.status !== 'active') return null;

  return (
    <AuthPanel
      title="Your workspace"
      description={`Signed in as ${session.identity.email}.`}
    >
      <SignOutButton />
    </AuthPanel>
  );
}
