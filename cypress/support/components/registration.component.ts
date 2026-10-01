import { registrationSelectors as s } from '../selectors/registration.selectors';
import type { RegisteredUser } from '../types/account';

export const registrationComponent = {
  fillNameAndEmail(name: string, email: string) {
    cy.getByQa(s.signupNameInput).should('be.visible').clear().type(name);
    cy.getByQa(s.signupEmailInput).should('be.visible').clear().type(email);
  },

  submitSignup() {
    return cy.getByQa(s.signupButton).should('be.enabled').click();
  },

  expectEmailAlreadyExistsError() {
    return cy.contains('Email Address already exist!').should('be.visible');
  },

  fillAccountDetails({ credentials, profile }: RegisteredUser) {
    cy.getByQa(s.titleGroup).find(`input[value="${profile.title}"]`).check();
    cy.getByQa(s.passwordInput).should('be.visible').type(credentials.password, { log: false });
    cy.getByQa(s.birthDaySelect).select(profile.birthDate);
    cy.getByQa(s.birthMonthSelect).select(profile.birthMonth);
    cy.getByQa(s.birthYearSelect).select(profile.birthYear);
    cy.getByQa(s.firstNameInput).type(profile.firstName);
    cy.getByQa(s.lastNameInput).type(profile.lastName);
    cy.getByQa(s.companyInput).type(profile.company);
    cy.getByQa(s.address1Input).type(profile.address1);
    cy.getByQa(s.address2Input).type(profile.address2);
    cy.getByQa(s.countrySelect).select(profile.country);
    cy.getByQa(s.stateInput).type(profile.state);
    cy.getByQa(s.cityInput).type(profile.city);
    cy.getByQa(s.zipcodeInput).type(profile.zipcode);
    cy.getByQa(s.mobileNumberInput).type(profile.mobileNumber);
  },

  submitAccount() {
    return cy.getByQa(s.createAccountButton).should('be.enabled').click();
  },

  expectAccountCreated() {
    return cy.getByQa(s.accountCreatedHeading).should('be.visible');
  },

  continueToStore() {
    return cy.getByQa(s.continueButton).should('be.visible').click();
  },
};
