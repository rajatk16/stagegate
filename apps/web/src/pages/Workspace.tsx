import { useAuth } from '@/features/auth/context/auth';

export function Workspace() {
  const { session } = useAuth();
  if (session.status !== 'active') return null;

  return <div>Your workspace</div>;
}
