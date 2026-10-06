import { randomUUID } from 'node:crypto';
import {
  EmailReceipt,
  TransactionalEmail,
  TransactionalEmailProvider,
} from '../types';

export class MemoryEmailProvider extends TransactionalEmailProvider {
  readonly messages: TransactionalEmail[] = [];

  async send(message: TransactionalEmail): Promise<EmailReceipt> {
    this.messages.push({ ...message });

    return {
      status: 'ACCEPTED',
      messageId: randomUUID(),
    };
  }
}
