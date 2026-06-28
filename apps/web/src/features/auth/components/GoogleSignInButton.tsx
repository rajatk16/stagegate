import { Button } from '@/components/ui';

import { useAuthenticate } from '../hooks';

export const GoogleSignInButton = () => {
  const { authenticate, isPending } = useAuthenticate();

  return (
    <Button
      className="w-full"
      disabled={isPending}
      onClick={() => void authenticate()}
    >
      {isPending ? 'Signing in...' : 'Continue with Google'}
    </Button>
  );
};
