import { qa, role, selector } from './selector';

export const accountCreatedSelectors = {
  heading: selector('accountCreated.heading', qa('account-created'), role('heading', 'Account Created!')),
  continueButton: selector('accountCreated.continueButton', qa('continue-button'), role('link', 'Continue')),
};
