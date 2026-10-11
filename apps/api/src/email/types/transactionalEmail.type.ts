export interface TransactionalEmail {
  to: string;
  subject: string;
  text: string;
  idempotencyKey: string;
}
