import type { AccountProfile } from './account';
import type { Product } from './catalog';

/**
 * Everything that depends on the target application or its test data. It is built from .env (see
 * cypress/config/load-config.ts and .env.example) and read in specs through `appConfig()`.
 */
export interface AppConfig {
  baseUrl: string;
  /** Attribute holding the test ids agreed with development, e.g. `data-qa`, `data-testid`. */
  testIdAttribute: string;
  /** Third-party hosts blocked during runs (consent dialogs, ads) because they overlay the app. */
  blockHosts: string[];
  testUser: {
    /** Generated users get `<emailPrefix>.<unique id>@<emailDomain>`. */
    emailPrefix: string;
    emailDomain: string;
    /** Fixed password for generated users; random per scenario when not set. */
    password?: string;
    profile: AccountProfile;
  };
  contact: {
    name: string;
    /** Contact emails get `<emailPrefix>.<unique id>@<emailDomain>`. */
    emailPrefix: string;
    emailDomain: string;
  };
  /** Test payment card. Never a real card. */
  payment: {
    cardNumber: string;
    cvc: string;
    expiryMonth: string;
    /** Defaults to the current year + 5 when not set. */
    expiryYear?: string;
  };
  /** Reference product data, loaded from the JSON file named by CATALOG_FIXTURE. */
  catalog: Product[];
}
