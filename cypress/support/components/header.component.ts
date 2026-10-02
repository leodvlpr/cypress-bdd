import { headerSelectors } from '../selectors/header.selectors';

export const headerComponent = {
  expectLogoVisible() {
    return cy.getElement(headerSelectors.logo).should('be.visible');
  },

  clickLogout() {
    return cy.getElement(headerSelectors.logoutLink).should('be.visible').click();
  },

  expectLoggedInAs(name: string) {
    return cy.getElement(headerSelectors.loggedInAs(name)).should('be.visible');
  },

  expectLoggedOut() {
    cy.getElement(headerSelectors.loginLink).should('be.visible');
    return cy.expectAbsent(headerSelectors.sessionIndicator);
  },
};
