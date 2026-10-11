export class EmailDeliveryError extends Error {
  constructor() {
    super('EMAIL_DELIVERY_UNCONFIRMED');
    this.name = 'EmailDeliveryError';
  }
}
