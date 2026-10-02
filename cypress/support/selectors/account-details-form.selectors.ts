import type { AccountProfile } from '../types/account';
import { css, id, paramSelector, qa, role, selector } from './selector';

const TITLE_RADIO_IDS: Record<AccountProfile['title'], string> = { Mr: 'id_gender1', Mrs: 'id_gender2' };

export const accountDetailsFormSelectors = {
  // data-qa="title" wraps both radios; the radio itself is picked by its form value (Mr / Mrs).
  titleRadio: (title: AccountProfile['title']) =>
    paramSelector(
      'accountDetailsForm.titleRadio',
      { title },
      css(`[data-qa="title"] input[value="${title}"]`),
      id(TITLE_RADIO_IDS[title]),
      role('radio', `${title}.`),
    ),
  passwordInput: selector('accountDetailsForm.passwordInput', qa('password'), id('password')),
  birthDaySelect: selector('accountDetailsForm.birthDaySelect', qa('days'), id('days')),
  birthMonthSelect: selector('accountDetailsForm.birthMonthSelect', qa('months'), id('months')),
  birthYearSelect: selector('accountDetailsForm.birthYearSelect', qa('years'), id('years')),
  firstNameInput: selector('accountDetailsForm.firstNameInput', qa('first_name'), id('first_name')),
  lastNameInput: selector('accountDetailsForm.lastNameInput', qa('last_name'), id('last_name')),
  companyInput: selector('accountDetailsForm.companyInput', qa('company'), id('company')),
  address1Input: selector('accountDetailsForm.address1Input', qa('address'), id('address1')),
  address2Input: selector('accountDetailsForm.address2Input', qa('address2'), id('address2')),
  countrySelect: selector('accountDetailsForm.countrySelect', qa('country'), id('country')),
  stateInput: selector('accountDetailsForm.stateInput', qa('state'), id('state')),
  cityInput: selector('accountDetailsForm.cityInput', qa('city'), id('city')),
  zipcodeInput: selector('accountDetailsForm.zipcodeInput', qa('zipcode'), id('zipcode')),
  mobileNumberInput: selector('accountDetailsForm.mobileNumberInput', qa('mobile_number'), id('mobile_number')),
  createAccountButton: selector('accountDetailsForm.createAccountButton', qa('create-account'), role('button', 'Create Account')),
};
