export interface EmailReceipt {
  status: 'ACCEPTED' | 'CAPTURED';
  messageId: string;
}
