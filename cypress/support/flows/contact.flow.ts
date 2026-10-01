import { contactComponent } from '../components/contact.component';
import { navigationComponent } from '../components/navigation.component';
import type { ContactMessage } from '../types/contact';

/**
 * The site handles this form client-side only (confirm dialog + success banner, no request),
 * so the observable condition to wait for is the confirm dialog itself.
 */
export function sendContactMessage(message: ContactMessage) {
  navigationComponent.goToContactUs();
  const confirmShown = cy.stub().as('contactConfirm').returns(true);
  cy.on('window:confirm', confirmShown);
  contactComponent.fill(message);
  contactComponent.submit();
  cy.get('@contactConfirm').should('have.been.calledOnceWith', 'Press OK to proceed!');
}
