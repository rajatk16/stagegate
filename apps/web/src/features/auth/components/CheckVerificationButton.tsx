import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { useAuth } from '../context/auth';

export const CheckVerificationButton = () => {
  const { checkVerification, session } = useAuth();
  const [busy, setBusy] = useState(false);
  const [checked, setChecked] = useState(false);

  async function check() {
    setBusy(true);
    setChecked(false);
    try {
      const verified = await checkVerification();
      setChecked(!verified);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Button
        type="button"
        className="min-h-11 w-full"
        disabled={busy}
        onClick={() => void check()}
      >
        {busy
          ? 'Checking...'
          : session.status === 'error'
            ? 'Try again'
            : "I've verified my email"}
      </Button>
      {checked && session.status === 'verify' && (
        <p role="status" className="mt-2 text-sm text-muted-foreground">
          Your email is still waiting verification. Open the link from your
          inbox, then try again.
        </p>
      )}
    </div>
  );
};
