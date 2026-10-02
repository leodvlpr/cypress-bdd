import { appConfig } from '../config';
import type { PaymentCard } from '../types/checkout';

/** Test card from .env (PAYMENT_CARD_*). It must be a test number; the stores under test never charge it. */
export function buildTestCard(nameOnCard: string): PaymentCard {
  const { cardNumber, cvc, expiryMonth, expiryYear } = appConfig().payment;
  return {
    nameOnCard,
    number: cardNumber,
    cvc,
    expiryMonth,
    expiryYear: expiryYear ?? String(new Date().getFullYear() + 5),
  };
}
