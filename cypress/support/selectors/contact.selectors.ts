import { qa, selector, text } from './selector';

export const contactSelectors = {
  nameInput: selector('contact.nameInput', qa('name')),
  emailInput: selector('contact.emailInput', qa('email')),
  subjectInput: selector('contact.subjectInput', qa('subject')),
  messageInput: selector('contact.messageInput', qa('message')),
  submitButton: selector('contact.submitButton', qa('submit-button')),
  successMessage: selector('contact.successMessage', text('Success! Your details have been submitted successfully.')),
};
