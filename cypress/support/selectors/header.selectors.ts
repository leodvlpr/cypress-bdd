import { css, selector, text } from './selector';

// The header has no data-qa yet (requested: logo, logout-link, login-link, logged-in-user).
export const headerSelectors = {
  logo: selector('header.logo', css('img[alt="Website for automation practice"]')),
  loginLink: selector('header.loginLink', text('Signup / Login', 'a')),
  logoutLink: selector('header.logoutLink', text('Logout', 'a')),
  sessionIndicator: selector('header.sessionIndicator', text('Logged in as')),
  loggedInAs: (name: string) => selector('header.loggedInAs', text(`Logged in as ${name}`)),
};
