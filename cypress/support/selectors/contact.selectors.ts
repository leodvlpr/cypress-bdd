import { css, qa, role, selector, text } from './selector';

export const contactSelectors = {
  nameInput: selector('contact.nameInput', qa('name'), css('input[name="name"]')),
  emailInput: selector('contact.emailInput', qa('email'), css('input[name="email"]')),
  subjectInput: selector('contact.subjectInput', qa('subject'), css('input[name="subject"]')),
  messageInput: selector('contact.messageInput', qa('message'), css('textarea[name="message"]')),
  submitButton: selector('contact.submitButton', qa('submit-button'), role('button', 'Submit')),
  successMessage: selector('contact.successMessage', text('Success! Your details have been submitted successfully.')),
};
