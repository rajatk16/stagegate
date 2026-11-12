import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { useAuth } from '../context/auth';

export const SignOutButton = () => {
  const { signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const leave = async () => {
    setBusy(true);
    setFailed(false);
    try {
      await signOut();
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="min-h-11 cursor-pointer"
        disabled={busy}
        onClick={() => void leave()}
      >
        {busy ? 'Signing out...' : 'Sign out'}
      </Button>
      {failed && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          We couldn't sign you out. Try again.
        </p>
      )}
    </>
  );
};
