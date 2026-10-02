import { appConfig } from '../config';
import type { RegisteredUser } from '../types/account';

/**
 * Builds a throwaway user with a unique email so scenarios never share data. The email pattern, the
 * profile and an optional fixed password come from .env (TEST_USER_*); otherwise the password is random.
 */
export function buildUniqueUser(): RegisteredUser {
  const { emailPrefix, emailDomain, password, profile } = appConfig().testUser;
  const uniqueId = `${Date.now()}${Cypress._.random(100000, 999999)}`;

  return {
    name: `${profile.firstName} ${profile.lastName} ${uniqueId}`,
    credentials: {
      email: `${emailPrefix}.${uniqueId}@${emailDomain}`,
      password: password ?? `Qa-${Cypress._.random(1e9, 9e9).toString(36)}-${Cypress._.random(1e9, 9e9).toString(36)}`,
    },
    profile: { ...profile },
  };
}
