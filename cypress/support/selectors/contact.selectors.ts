import { css, role, selector, testId, text } from './selector';

export const contactSelectors = {
  nameInput: selector('contact.nameInput', testId('name'), css('input[name="name"]')),
  emailInput: selector('contact.emailInput', testId('email'), css('input[name="email"]')),
  subjectInput: selector('contact.subjectInput', testId('subject'), css('input[name="subject"]')),
  messageInput: selector('contact.messageInput', testId('message'), css('textarea[name="message"]')),
  submitButton: selector('contact.submitButton', testId('submit-button'), role('button', 'Submit')),
  successMessage: selector('contact.successMessage', text('Success! Your details have been submitted successfully.')),
};
