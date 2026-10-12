import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { resolveInvitationToken } from '@/lib';

type LinkState =
  | {
      status: 'loading';
    }
  | {
      status: 'error';
      message: string;
    }
  | {
      status: 'ready';
      token: string;
    };

export const useInvitationLink = (invitationId: string): LinkState => {
  const location = useLocation();
  const navigate = useNavigate();

  const [state, setState] = useState<LinkState>({ status: 'loading' });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        const token = resolveInvitationToken(invitationId, location.hash);

        setState({ status: 'ready', token });

        if (location.hash !== '' || location.search !== '') {
          void navigate(`/invitations/${invitationId}`, {
            replace: true,
          });
        }
      } catch (error) {
        setState({
          status: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'This invitation could not be opened.',
        });
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [invitationId, location.hash, location.search, navigate]);

  return state;
};
