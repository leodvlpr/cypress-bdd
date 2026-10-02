import { contactSelectors } from '../selectors/contact.selectors';
import type { ContactMessage } from '../types/contact';

export const contactComponent = {
  fill({ name, email, subject, message }: ContactMessage) {
    cy.getElement(contactSelectors.nameInput).should('be.visible').type(name);
    cy.getElement(contactSelectors.emailInput).type(email);
    cy.getElement(contactSelectors.subjectInput).type(subject);
    cy.getElement(contactSelectors.messageInput).type(message);
  },

  submit() {
    return cy.getElement(contactSelectors.submitButton).should('be.enabled').click();
  },

  expectSubmitted() {
    return cy.getElement(contactSelectors.successMessage).should('be.visible');
  },
};
