import type { Credentials, RegisteredUser } from './account';
import type { SelectorDefinition } from './selector';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Resolves a selector definition to its element(s). Every element lookup goes through this
       * command, so selector strategy handling lives in one place.
       * @example cy.getElement(authSelectors.loginEmailInput)
       */
      getElement(definition: SelectorDefinition, options?: Partial<Loggable & Timeoutable>): Chainable<JQuery<HTMLElement>>;

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
