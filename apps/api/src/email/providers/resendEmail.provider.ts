import z from 'zod';
import { randomUUID } from 'node:crypto';

import {
  EmailReceipt,
  EmailDeliveryError,
  TransactionalEmail,
  TransactionalEmailProvider,
} from '../types';

const receiptSchema = z.object({
  id: z.string().min(1),
});

export class ResendEmailProvider extends TransactionalEmailProvider {
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {
    super();
  }

  async send(message: TransactionalEmail): Promise<EmailReceipt> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        redirect: 'error',
        signal: AbortSignal.timeout(10_000),
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': message.idempotencyKey,
        },
        body: JSON.stringify({
          from: this.from,
          to: [message.to],
          subject: message.subject,
          text: message.text,
        }),
      });

      if (!response.ok) {
        throw new EmailDeliveryError();
      }

      const payload: unknown = await response.json();

      const result = receiptSchema.safeParse(payload);

      if (!result.success) {
        throw new EmailDeliveryError();
      }

      return {
        status: 'CAPTURED',
        messageId: randomUUID(),
      };
    } catch {
      throw new EmailDeliveryError();
    }
  }
}
