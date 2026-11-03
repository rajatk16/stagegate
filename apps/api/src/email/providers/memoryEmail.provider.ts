import { randomUUID } from 'node:crypto';

import { EmailReceipt } from '../types/emailReceipt.type';
import { TransactionalEmailProvider } from '../types/transactionalEmailProvider.type';
import { TransactionalEmail } from '../types/transactionalEmail.type';

export class MemoryEmailProvider extends TransactionalEmailProvider {
  readonly messages: TransactionalEmail[] = [];

  async send(message: TransactionalEmail): Promise<EmailReceipt> {
    this.messages.push({ ...message });

    return {
      status: 'CAPTURED',
      messageId: randomUUID(),
    };
  }
}
