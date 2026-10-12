import { Link } from 'react-router';
import { User } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';

import { Button, InlineAlert } from '@/components';
import { refreshVerification } from '@/features/auth';
import { ApiError, clearInvitationToken, getAuthUrl } from '@/lib';

import { AcceptedInvitation } from './AcceptedInvitation';
import { acceptInvitation, getAcceptanceProblem } from '../services';
import {
  AcceptanceProblem,
  AcceptedInvitation as AcceptanceResult,
} from '../types';

type AcceptanceState =
  | { status: 'ready' }
  | { status: 'pending' }
  | { status: 'error'; problem: AcceptanceProblem }
  | { status: 'success'; result: AcceptanceResult };

type SignedInProps = {
  user: User;
  invitationId: string;
  token: string;
  switching: boolean;
  onSwitchAccount: () => void;
};

export const SignedInAcceptance = ({
  user,
  invitationId,
  token,
  switching,
  onSwitchAccount,
}: SignedInProps) => {
  const [state, setState] = useState<AcceptanceState>({
    status: 'ready',
  });

  const request = useRef<AbortController | null>(null);
  const returnTo = `/invitations/${invitationId}`;

  useEffect(
    () => () => {
      request.current?.abort();
    },
    [],
  );

  const accept = async () => {
    if (request.current !== null || switching) return;

    const controller = new AbortController();
    request.current = controller;
    setState({ status: 'pending' });

    try {
      // Refresh both the account and ID-token verification claim.
      const verified = await refreshVerification();
      controller.signal.throwIfAborted();

      if (!verified) {
        throw new ApiError(
          'Email verification required.',
          'http',
          403,
          'AUTH_EMAIL_NOT_VERIFIED',
        );
      }

      const result = await acceptInvitation(
        user,
        invitationId,
        token,
        controller.signal,
      );

      if (controller.signal.aborted) return;

      clearInvitationToken(invitationId);
      setState({ status: 'success', result });
    } catch (error: unknown) {
      if (controller.signal.aborted) return;

      const problem = getAcceptanceProblem(error);

      if (problem.kind === 'unavailable' || problem.kind === 'already-member') {
        clearInvitationToken(invitationId);
      }

      setState({ status: 'error', problem });
    } finally {
      if (request.current === controller) {
        request.current = null;
      }
    }
  };

  if (state.status === 'success') {
    return <AcceptedInvitation user={user} result={state.result} />;
  }

  const problem = state.status === 'error' ? state.problem : null;
  const busy = state.status === 'pending' || switching;

  const needsVerification =
    !user.emailVerified || problem?.kind === 'verify-email';

  const canAccept =
    !needsVerification && (problem === null || problem.kind === 'retry');

  return (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-muted-foreground">
        Signed in as{' '}
        <strong className="break-all text-foreground">
          {user.email ?? 'an account without an email address'}
        </strong>
        . Use the account whose email address received the invitation.
      </p>

      {problem && (
        <InlineAlert
          tone={problem.kind === 'already-member' ? 'info' : 'error'}
          title={
            problem.kind === 'wrong-account'
              ? 'Use the invited account'
              : undefined
          }
        >
          {problem.message}
        </InlineAlert>
      )}

      {needsVerification && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Verify this account’s email address before accepting.
          </p>

          {!busy && (
            <Button asChild>
              <Link to={getAuthUrl('/verify-email', returnTo)}>
                Verify email
              </Link>
            </Button>
          )}
        </div>
      )}

      {canAccept && (
        <Button type="button" disabled={busy} onClick={() => void accept()}>
          {state.status === 'pending'
            ? 'Accepting invitation…'
            : problem?.kind === 'retry'
              ? 'Retry acceptance'
              : 'Accept invitation'}
        </Button>
      )}

      {(problem?.kind === 'already-member' ||
        problem?.kind === 'unavailable') && (
        <Button asChild variant="outline">
          <Link to="/organizations">View organizations</Link>
        </Button>
      )}

      <Button
        type="button"
        variant="outline"
        disabled={busy}
        onClick={onSwitchAccount}
      >
        {switching ? 'Signing out…' : 'Use another account'}
      </Button>

      <p role="status" className="sr-only">
        {state.status === 'pending' ? 'Accepting invitation…' : ''}
      </p>
    </div>
  );
};
