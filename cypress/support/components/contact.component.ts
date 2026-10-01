import { contactSelectors } from '../selectors/contact.selectors';
import type { ContactMessage } from '../types/contact';

export const contactComponent = {
  fill({ name, email, subject, message }: ContactMessage) {
    cy.getByQa(contactSelectors.nameInput).should('be.visible').type(name);
    cy.getByQa(contactSelectors.emailInput).type(email);
    cy.getByQa(contactSelectors.subjectInput).type(subject);
    cy.getByQa(contactSelectors.messageInput).type(message);
  },

  submit() {
    return cy.getByQa(contactSelectors.submitButton).should('be.enabled').click();
  },

  expectSubmitted() {
    return cy.contains('Success! Your details have been submitted successfully.').should('be.visible');
  },
};
