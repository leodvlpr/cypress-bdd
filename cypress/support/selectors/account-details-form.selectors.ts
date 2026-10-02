import type { AccountProfile } from '../types/account';
import { css, qa, selector } from './selector';

export const accountDetailsFormSelectors = {
  // data-qa="title" wraps both radios; the radio itself is picked by its form value (Mr / Mrs).
  titleRadio: (title: AccountProfile['title']) =>
    selector('accountDetailsForm.titleRadio', css(`[data-qa="title"] input[value="${title}"]`)),
  passwordInput: selector('accountDetailsForm.passwordInput', qa('password')),
  birthDaySelect: selector('accountDetailsForm.birthDaySelect', qa('days')),
  birthMonthSelect: selector('accountDetailsForm.birthMonthSelect', qa('months')),
  birthYearSelect: selector('accountDetailsForm.birthYearSelect', qa('years')),
  firstNameInput: selector('accountDetailsForm.firstNameInput', qa('first_name')),
  lastNameInput: selector('accountDetailsForm.lastNameInput', qa('last_name')),
  companyInput: selector('accountDetailsForm.companyInput', qa('company')),
  address1Input: selector('accountDetailsForm.address1Input', qa('address')),
  address2Input: selector('accountDetailsForm.address2Input', qa('address2')),
  countrySelect: selector('accountDetailsForm.countrySelect', qa('country')),
  stateInput: selector('accountDetailsForm.stateInput', qa('state')),
  cityInput: selector('accountDetailsForm.cityInput', qa('city')),
  zipcodeInput: selector('accountDetailsForm.zipcodeInput', qa('zipcode')),
  mobileNumberInput: selector('accountDetailsForm.mobileNumberInput', qa('mobile_number')),
  createAccountButton: selector('accountDetailsForm.createAccountButton', qa('create-account')),
};
