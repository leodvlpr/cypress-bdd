import type { PaymentCard } from '../types/checkout';

/** The store does not process payments; 4111 1111 1111 1111 is the public Visa test number. */
export function buildTestCard(nameOnCard: string): PaymentCard {
  return {
    nameOnCard,
    number: '4111111111111111',
    cvc: '123',
    expiryMonth: '12',
    expiryYear: String(new Date().getFullYear() + 5),
  };
}
