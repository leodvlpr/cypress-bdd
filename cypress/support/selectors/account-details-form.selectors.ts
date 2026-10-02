import type { AccountProfile } from '../types/account';
import { css, id, paramSelector, role, selector, testId } from './selector';

const TITLE_RADIO_IDS: Record<AccountProfile['title'], string> = { Mr: 'id_gender1', Mrs: 'id_gender2' };

export const accountDetailsFormSelectors = {
  // The radio has no data-qa of its own (requested: title-mr / title-mrs); its app-owned id is the primary.
  // The data-qa="title" wrapper scoping is kept only as a fallback (ancestor scoping is not allowed as primary).
  // It is pinned to this site's `data-qa` on purpose: like every selector definition it describes the current app,
  // so it does not follow TEST_ID_ATTRIBUTE and is rewritten when the suite is retargeted.
  titleRadio: (title: AccountProfile['title']) =>
    paramSelector(
      'accountDetailsForm.titleRadio',
      { title },
      id(TITLE_RADIO_IDS[title]),
      role('radio', `${title}.`),
      css(`[data-qa="title"] input[value="${title}"]`),
    ),
  passwordInput: selector('accountDetailsForm.passwordInput', testId('password'), id('password')),
  birthDaySelect: selector('accountDetailsForm.birthDaySelect', testId('days'), id('days')),
  birthMonthSelect: selector('accountDetailsForm.birthMonthSelect', testId('months'), id('months')),
  birthYearSelect: selector('accountDetailsForm.birthYearSelect', testId('years'), id('years')),
  firstNameInput: selector('accountDetailsForm.firstNameInput', testId('first_name'), id('first_name')),
  lastNameInput: selector('accountDetailsForm.lastNameInput', testId('last_name'), id('last_name')),
  companyInput: selector('accountDetailsForm.companyInput', testId('company'), id('company')),
  address1Input: selector('accountDetailsForm.address1Input', testId('address'), id('address1')),
  address2Input: selector('accountDetailsForm.address2Input', testId('address2'), id('address2')),
  countrySelect: selector('accountDetailsForm.countrySelect', testId('country'), id('country')),
  stateInput: selector('accountDetailsForm.stateInput', testId('state'), id('state')),
  cityInput: selector('accountDetailsForm.cityInput', testId('city'), id('city')),
  zipcodeInput: selector('accountDetailsForm.zipcodeInput', testId('zipcode'), id('zipcode')),
  mobileNumberInput: selector('accountDetailsForm.mobileNumberInput', testId('mobile_number'), id('mobile_number')),
  createAccountButton: selector('accountDetailsForm.createAccountButton', testId('create-account'), role('button', 'Create Account')),
};
