import { User } from 'firebase/auth';
import { Link, useNavigate } from 'react-router';
import { useEffect, useRef, useState } from 'react';

import { getOrganizationPath } from '@/lib';
import { Button, InlineAlert } from '@/components';
import { listMyOrganizations } from '@/features/organizations';

import { AcceptedInvitation as AcceptanceResult } from '../types';

type Props = {
  user: User;
  result: AcceptanceResult;
};

export const AcceptedInvitation = (props: Props) => {
  const navigate = useNavigate();
  const request = useRef<AbortController | null>(null);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () => () => {
      request.current?.abort();
    },
    [],
  );

  const openOrganization = async () => {
    if (request.current !== null) return;

    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setError(null);

    try {
      const organizations = await listMyOrganizations(
        props.user,
        controller.signal,
      );

      if (controller.signal.aborted) return;

      const organization = organizations.find(
        (item) => item.id === props.result.organizationId,
      );

      if (!organization) {
        setError(
          'Your membership was confirmed, but the organization is not currently available in your list. Refresh your organizations to check.',
        );
        return;
      }

      void navigate(getOrganizationPath(organization.slug), {
        replace: true,
      });
    } catch {
      if (!controller.signal.aborted) {
        setError(
          'Your membership was confirmed, but we could not load the organization. Try opening it again.',
        );
      }
    } finally {
      if (request.current === controller) {
        request.current = null;
      }
      if (!controller.signal.aborted) setPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <InlineAlert tone="success" title="Membership confirmed">
        {props.result.alreadyAccepted
          ? 'You have already accepted this invitation.'
          : 'You have joined the organization.'}
      </InlineAlert>

      {error && <InlineAlert tone="error">{error}</InlineAlert>}

      <div className="flex flex-wrap gap-3">
        <Button type="button" disabled={pending} onClick={openOrganization}>
          {pending ? 'Loading...' : 'Open organization'}
        </Button>
        <Button asChild variant="outline">
          <Link to="/organizations">View organizations</Link>
        </Button>
      </div>
    </div>
  );
};
