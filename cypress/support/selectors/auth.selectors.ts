import { css, role, selector, testId, text } from './selector';

export const authSelectors = {
  loginEmailInput: selector('auth.loginEmailInput', testId('login-email'), css('form[action="/login"] input[name="email"]')),
  loginPasswordInput: selector('auth.loginPasswordInput', testId('login-password'), css('form[action="/login"] input[name="password"]')),
  loginSubmitButton: selector('auth.loginSubmitButton', testId('login-button'), role('button', 'Login')),
  invalidCredentialsError: selector('auth.invalidCredentialsError', text('Your email or password is incorrect!')),
};
