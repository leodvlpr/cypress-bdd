import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I visit the homepage', () => {
  cy.visit('/');
});

Then('I should see the automationexercise logo', () => {
  cy.get('.logo img[alt="Website for automation practice"]').should('be.visible');
});
