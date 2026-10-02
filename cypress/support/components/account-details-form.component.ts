import { accountDetailsFormSelectors as s } from '../selectors/account-details-form.selectors';
import type { RegisteredUser } from '../types/account';

/** The account information + address form shown after starting a registration. */
export const accountDetailsFormComponent = {
  fill({ credentials, profile }: RegisteredUser) {
    cy.getElement(s.titleRadio(profile.title)).check();
    cy.getElement(s.passwordInput).should('be.visible').type(credentials.password, { log: false });
    cy.getElement(s.birthDaySelect).select(profile.birthDate);
    cy.getElement(s.birthMonthSelect).select(profile.birthMonth);
    cy.getElement(s.birthYearSelect).select(profile.birthYear);
    cy.getElement(s.firstNameInput).type(profile.firstName);
    cy.getElement(s.lastNameInput).type(profile.lastName);
    cy.getElement(s.companyInput).type(profile.company);
    cy.getElement(s.address1Input).type(profile.address1);
    cy.getElement(s.address2Input).type(profile.address2);
    cy.getElement(s.countrySelect).select(profile.country);
    cy.getElement(s.stateInput).type(profile.state);
    cy.getElement(s.cityInput).type(profile.city);
    cy.getElement(s.zipcodeInput).type(profile.zipcode);
    cy.getElement(s.mobileNumberInput).type(profile.mobileNumber);
  },

  submit() {
    return cy.getElement(s.createAccountButton).should('be.enabled').click();
  },
};
