import { role, selector, testId } from './selector';

export const accountCreatedSelectors = {
  heading: selector('accountCreated.heading', testId('account-created'), role('heading', 'Account Created!')),
  continueButton: selector('accountCreated.continueButton', testId('continue-button'), role('link', 'Continue')),
};
