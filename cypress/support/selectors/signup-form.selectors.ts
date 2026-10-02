import { css, role, selector, testId, text } from './selector';

export const signupFormSelectors = {
  nameInput: selector('signupForm.nameInput', testId('signup-name'), css('form[action="/signup"] input[name="name"]')),
  emailInput: selector('signupForm.emailInput', testId('signup-email'), css('form[action="/signup"] input[name="email"]')),
  submitButton: selector('signupForm.submitButton', testId('signup-button'), role('button', 'Signup')),
  emailExistsError: selector('signupForm.emailExistsError', text('Email Address already exist!')),
};
