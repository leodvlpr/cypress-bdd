export const navigationComponent = {
  goToLogin() {
    return cy.visit('/login');
  },

  goToProducts() {
    return cy.visit('/products');
  },

  goToProductDetails(productId: number) {
    return cy.visit(`/product_details/${productId}`);
  },

  goToCart() {
    return cy.visit('/view_cart');
  },

  goToContactUs() {
    return cy.visit('/contact_us');
  },

  // Header links have no data-qa yet; their accessible name is the contract. Requested: data-qa="logout-link".
  clickLogout() {
    return cy.contains('a', 'Logout').should('be.visible').click();
  },

  // The header has no data-qa for the session indicator yet; its visible text is the
  // contract under test. Requested hook for dev: data-qa="logged-in-user".
  expectLoggedInAs(name: string) {
    return cy.contains(`Logged in as ${name}`).should('be.visible');
  },

  expectLoggedOut() {
    cy.contains('a', 'Signup / Login').should('be.visible');
    return cy.contains('Logged in as').should('not.exist');
  },
};
