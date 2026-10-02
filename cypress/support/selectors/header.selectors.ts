import { css, paramSelector, role, selector, text } from './selector';

// No data-qa in the header yet (requested: logo, logout-link, login-link, logged-in-user).
export const headerSelectors = {
  logo: selector('header.logo', role('img', 'Website for automation practice'), css('img[src="/static/images/home/logo.png"]')),
  loginLink: selector('header.loginLink', role('link', 'Signup / Login'), css('a[href="/login"]'), text('Signup / Login', 'a')),
  logoutLink: selector('header.logoutLink', role('link', 'Logout'), css('a[href="/logout"]'), text('Logout', 'a')),
  // Rendered as an <a> without href (no link role), so its text is the only contract.
  sessionIndicator: selector('header.sessionIndicator', text('Logged in as')),
  loggedInAs: (name: string) => paramSelector('header.loggedInAs', { name }, text(`Logged in as ${name}`)),
};
