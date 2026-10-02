import { css, qa, role, selector, text } from './selector';

export const authSelectors = {
  loginEmailInput: selector('auth.loginEmailInput', qa('login-email'), css('form[action="/login"] input[name="email"]')),
  loginPasswordInput: selector('auth.loginPasswordInput', qa('login-password'), css('form[action="/login"] input[name="password"]')),
  loginSubmitButton: selector('auth.loginSubmitButton', qa('login-button'), role('button', 'Login')),
  invalidCredentialsError: selector('auth.invalidCredentialsError', text('Your email or password is incorrect!')),
};
