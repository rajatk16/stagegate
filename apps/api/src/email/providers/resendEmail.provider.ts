import z from 'zod';
import { Resend } from 'resend';

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
  private readonly client: Resend;
  constructor(
    apiKey: string,
    private readonly from: string,
  ) {
    super();
    this.client = new Resend(apiKey);
  }

  async send(message: TransactionalEmail): Promise<EmailReceipt> {
    try {
      const { data, error } = await this.client.emails.send(
        {
          from: this.from,
          to: [message.to],
          subject: message.subject,
          text: message.text,
        },
        {
          idempotencyKey: message.idempotencyKey,
          signal: AbortSignal.timeout(10_000),
        },
      );

      if (error) {
        throw new EmailDeliveryError();
      }

      const result = receiptSchema.safeParse(data);

      if (!result.success) {
        throw new EmailDeliveryError();
      }

      return {
        status: 'ACCEPTED',
        messageId: result.data.id,
      };
    } catch {
      throw new EmailDeliveryError();
    }
  }
}
