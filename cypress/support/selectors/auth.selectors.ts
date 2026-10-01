/** `data-qa` values for the login form, used with `cy.getByQa()`. */
export const authSelectors = {
  loginEmailInput: 'login-email',
  loginPasswordInput: 'login-password',
  loginSubmitButton: 'login-button',
} as const;
