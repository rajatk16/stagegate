import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { signOut, useAuth } from '@/features/auth';
import { getAuthErrorMessage, getAuthUrl } from '@/lib';
import {
  Card,
  Button,
  CardHeader,
  CardContent,
  InlineAlert,
} from '@/components';

import { useInvitationLink } from '../hooks';
import { SignedInAcceptance } from '../components';

export const AcceptInvitation = () => {
  const session = useAuth();
  const navigate = useNavigate();
  const { invitationId = '' } = useParams();
  const link = useInvitationLink(invitationId);

  const alive = useRef(false);
  const switchLock = useRef(false);

  const [switching, setSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  const returnTo = `/invitations/${invitationId}`;

  useEffect(() => {
    alive.current = true;

    return () => {
      alive.current = false;
    };
  }, []);

  const switchAccount = async () => {
    if (switchLock.current) return;

    switchLock.current = true;
    setSwitching(true);
    setSwitchError(null);

    try {
      await signOut();

      if (alive.current) {
        void navigate(getAuthUrl('/sign-in', returnTo), {
          replace: true,
        });
      }
    } catch (error: unknown) {
      if (alive.current) {
        setSwitchError(getAuthErrorMessage(error));
      }
    } finally {
      switchLock.current = false;

      if (alive.current) setSwitching(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <h1 className="text-2xl font-semibold tracking-tight">
          Organization invitation
        </h1>
      </CardHeader>

      <CardContent className="space-y-5">
        {switchError && <InlineAlert tone="error">{switchError}</InlineAlert>}

        {link.status === 'loading' && <p role="status">Opening invitation…</p>}

        {link.status === 'error' && (
          <InlineAlert tone="error" title="Could not open invitation">
            {link.message}
          </InlineAlert>
        )}

        {link.status === 'ready' && session.status === 'loading' && (
          <p role="status">Restoring your session…</p>
        )}

        {link.status === 'ready' && session.status === 'unauthenticated' && (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-muted-foreground">
              Sign in or create an account using the email address that received
              this invitation. You’ll return here before joining the
              organization.
            </p>

            {switching ? (
              <p role="status">Opening sign-in…</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link to={getAuthUrl('/sign-in', returnTo)}>Sign in</Link>
                </Button>

                <Button asChild variant="outline">
                  <Link to={getAuthUrl('/register', returnTo)}>
                    Create account
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}

        {link.status === 'ready' && session.status === 'authenticated' && (
          <SignedInAcceptance
            key={session.user.uid}
            user={session.user}
            invitationId={invitationId}
            token={link.token}
            switching={switching}
            onSwitchAccount={() => void switchAccount()}
          />
        )}
      </CardContent>
    </Card>
  );
};
