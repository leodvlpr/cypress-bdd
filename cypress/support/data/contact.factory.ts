import type { ContactMessage } from '../types/contact';

export function buildContactMessage(): ContactMessage {
  const uniqueId = `${Date.now()}${Cypress._.random(1000, 9999)}`;
  return {
    name: 'QA Visitor',
    email: `qa.contact.${uniqueId}@example.com`,
    subject: `Consulta de prueba ${uniqueId}`,
    message: 'Mensaje generado por la suite E2E. Puede ignorarse.',
  };
}
