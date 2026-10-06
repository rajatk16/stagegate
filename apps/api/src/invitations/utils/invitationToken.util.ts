import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export const normalizeInvitationEmail = (email: string): string =>
  email.trim().toLowerCase();

export const hashInvitationToken = (token: string): string =>
  createHash('sha256').update(token, 'utf8').digest('hex');

export const createInvitationToken = (): {
  token: string;
  tokenHash: string;
} => {
  const token = randomBytes(32).toString('base64url');

  return {
    token,
    tokenHash: hashInvitationToken(token),
  };
};

export const matchesInvitationToken = (
  token: string,
  expectedHash: string,
): boolean => {
  if (
    !/^[A-Za-z0-9_-]{43}$/.test(token) ||
    !/^[a-f0-9]{64}$/.test(expectedHash)
  ) {
    return false;
  }

  return timingSafeEqual(
    Buffer.from(hashInvitationToken(token), 'hex'),
    Buffer.from(expectedHash, 'hex'),
  );
};
