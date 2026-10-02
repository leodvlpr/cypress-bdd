import { qa, selector, text } from './selector';

export const signupFormSelectors = {
  nameInput: selector('signupForm.nameInput', qa('signup-name')),
  emailInput: selector('signupForm.emailInput', qa('signup-email')),
  submitButton: selector('signupForm.submitButton', qa('signup-button')),
  emailExistsError: selector('signupForm.emailExistsError', text('Email Address already exist!')),
};
