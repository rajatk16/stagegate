import { EmailReceipt } from './emailReceipt.type';
import { TransactionalEmail } from './transactionalEmail.type';

export abstract class TransactionalEmailProvider {
  abstract send(message: TransactionalEmail): Promise<EmailReceipt>;
}
