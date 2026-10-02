import { qa, selector } from './selector';

export const accountCreatedSelectors = {
  heading: selector('accountCreated.heading', qa('account-created')),
  continueButton: selector('accountCreated.continueButton', qa('continue-button')),
};
