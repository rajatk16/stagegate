import { createHmac } from 'node:crypto';

export const stagegateHmac = (domain: string, value: string): string => {
  const secret = process.env.STAGEGATE_EMAIL_HMAC_KEY;
  if (!secret || !/^[a-f0-9]{64}$/i.test(secret)) {
    throw new Error(
      'STAGEGATE_EMAIL_HMAC_KEY must contain 32 hex-encoded bytes.',
    );
  }
  return createHmac('sha256', Buffer.from(secret, 'hex'))
    .update(domain)
    .update('\0')
    .update(value)
    .digest('hex');
};
