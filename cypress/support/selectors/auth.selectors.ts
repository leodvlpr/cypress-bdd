import { qa, selector, text } from './selector';

export const authSelectors = {
  loginEmailInput: selector('auth.loginEmailInput', qa('login-email')),
  loginPasswordInput: selector('auth.loginPasswordInput', qa('login-password')),
  loginSubmitButton: selector('auth.loginSubmitButton', qa('login-button')),
  invalidCredentialsError: selector('auth.invalidCredentialsError', text('Your email or password is incorrect!')),
};
