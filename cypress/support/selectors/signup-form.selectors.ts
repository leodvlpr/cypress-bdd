import { css, qa, role, selector, text } from './selector';

export const signupFormSelectors = {
  nameInput: selector('signupForm.nameInput', qa('signup-name'), css('form[action="/signup"] input[name="name"]')),
  emailInput: selector('signupForm.emailInput', qa('signup-email'), css('form[action="/signup"] input[name="email"]')),
  submitButton: selector('signupForm.submitButton', qa('signup-button'), role('button', 'Signup')),
  emailExistsError: selector('signupForm.emailExistsError', text('Email Address already exist!')),
};
