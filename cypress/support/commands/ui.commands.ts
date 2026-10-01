Cypress.Commands.add('getByQa', (qa, options) => cy.get(`[data-qa="${qa}"]`, options));
