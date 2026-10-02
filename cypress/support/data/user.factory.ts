import type { RegisteredUser } from '../types/account';

/**
 * Builds a throwaway user with a unique email and random password, so scenarios
 * never share data and no credentials live in the repository.
 */
export function buildUniqueUser(): RegisteredUser {
  const uniqueId = `${Date.now()}${Cypress._.random(100000, 999999)}`;

  return {
    name: `QA User ${uniqueId}`,
    credentials: {
      email: `qa.user.${uniqueId}@example.com`,
      password: `Qa-${Cypress._.random(1e9, 9e9).toString(36)}-${Cypress._.random(1e9, 9e9).toString(36)}`,
    },
    profile: {
      title: 'Mr',
      birthDate: '1',
      birthMonth: '1',
      birthYear: '1990',
      firstName: 'QA',
      lastName: 'User',
      company: 'Test Co',
      address1: '1 Test Street',
      address2: 'Apt 1',
      country: 'Canada',
      zipcode: '00000',
      state: 'Test State',
      city: 'Test City',
      mobileNumber: '0000000000',
    },
  };
}
