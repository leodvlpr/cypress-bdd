import type { ApiResponse, Credentials, RegisteredUser } from '../types/account';

const ACCOUNT_CREATED = 201;
const ACCOUNT_DELETED = 200;

// The API answers with a text/html body containing JSON, so it has to be parsed by hand.
function parseApiResponse(body: unknown): ApiResponse {
  const parsed: unknown = typeof body === 'string' ? JSON.parse(body) : body;
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    typeof (parsed as ApiResponse).responseCode !== 'number' ||
    typeof (parsed as ApiResponse).message !== 'string'
  ) {
    throw new Error('Unexpected API response shape');
  }
  return parsed as ApiResponse;
}

function expectResponseCode(action: string, body: unknown, expected: number): void {
  const { responseCode, message } = parseApiResponse(body);
  if (responseCode !== expected) {
    throw new Error(`${action} failed: expected responseCode ${expected}, got ${responseCode} (${message})`);
  }
}

Cypress.Commands.add('createAccountByApi', (user: RegisteredUser) => {
  const { name, credentials, profile } = user;
  Cypress.log({ name: 'createAccountByApi', message: credentials.email });

  // log: false + failOnStatusCode: false keep the password out of the command log and error messages.
  cy.request({
    method: 'POST',
    url: '/api/createAccount',
    form: true,
    log: false,
    failOnStatusCode: false,
    body: {
      name,
      email: credentials.email,
      password: credentials.password,
      title: profile.title,
      birth_date: profile.birthDate,
      birth_month: profile.birthMonth,
      birth_year: profile.birthYear,
      firstname: profile.firstName,
      lastname: profile.lastName,
      company: profile.company,
      address1: profile.address1,
      address2: profile.address2,
      country: profile.country,
      zipcode: profile.zipcode,
      state: profile.state,
      city: profile.city,
      mobile_number: profile.mobileNumber,
    },
  }).then(({ body }) => expectResponseCode('createAccountByApi', body, ACCOUNT_CREATED));
});

Cypress.Commands.add('deleteAccountByApi', (credentials: Credentials) => {
  Cypress.log({ name: 'deleteAccountByApi', message: credentials.email });

  cy.request({
    method: 'DELETE',
    url: '/api/deleteAccount',
    form: true,
    log: false,
    failOnStatusCode: false,
    body: { email: credentials.email, password: credentials.password },
  }).then(({ body }) => expectResponseCode('deleteAccountByApi', body, ACCOUNT_DELETED));
});
