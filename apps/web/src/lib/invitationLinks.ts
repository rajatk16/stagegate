export const INVITATION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const INVITATION_PATH_PATTERN =
  /^\/invitations\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

const storageKey = (invitationId: string) =>
  `stagegate:invitation:v1:${invitationId}`;

export const clearInvitationToken = (invitationId: string): void => {
  try {
    window.sessionStorage.removeItem(storageKey(invitationId));
  } catch {
    // Storage may have become unavailable since the token was saved.
  }
};

export const resolveInvitationToken = (
  invitationId: string,
  hash: string,
): string => {
  if (!INVITATION_ID_PATTERN.test(invitationId)) {
    throw new Error('This invitation link is invalid.');
  }

  if (hash !== '') {
    const params = new URLSearchParams(hash.slice(1));
    const tokens = params.getAll('token');
    const token = tokens[0];

    if (
      params.size !== 1 ||
      tokens.length !== 1 ||
      !token ||
      !TOKEN_PATTERN.test(token)
    ) {
      clearInvitationToken(invitationId);
      throw new Error('Open the complete invitation link from your email.');
    }

    try {
      window.sessionStorage.setItem(storageKey(invitationId), token);
    } catch {
      throw new Error(
        'Your browser could not preserve this invitation through sign-in. ' +
          'Allow site storage, then reopen the invitation email link.',
      );
    }

    return token;
  }

  let token: string | null;

  try {
    token = window.sessionStorage.getItem(storageKey(invitationId));
  } catch {
    throw new Error(
      'Your browser could not restore this invitation. ' +
        'Allow site storage, then reopen the invitation email link.',
    );
  }

  if (!token || !TOKEN_PATTERN.test(token)) {
    clearInvitationToken(invitationId);

    throw new Error(
      'Open the complete invitation link from your email in this tab.',
    );
  }

  return token;
};
