/** `data-qa` values for the contact form, used with `cy.getByQa()`. */
export const contactSelectors = {
  nameInput: 'name',
  emailInput: 'email',
  subjectInput: 'subject',
  messageInput: 'message',
  submitButton: 'submit-button',
} as const;
