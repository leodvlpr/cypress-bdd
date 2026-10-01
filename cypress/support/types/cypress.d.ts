import type { Credentials, RegisteredUser } from './account';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Gets element(s) by their `data-qa` attribute, the test-id convention used by automationexercise.com.
       * @example cy.getByQa('login-email')
       */
      getByQa(qa: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>;

      /**
       * Creates an account through the public API. Fails with the API message if the account is not created.
       * The password is never written to the command log.
       * @example cy.createAccountByApi(buildUniqueUser())
       */
      createAccountByApi(user: RegisteredUser): Chainable<void>;

      /**
       * Deletes an account through the public API. Fails with the API message if the account is not deleted.
       * The password is never written to the command log.
       * @example cy.deleteAccountByApi(user.credentials)
       */
      deleteAccountByApi(credentials: Credentials): Chainable<void>;
    }
  }
}

export {};
